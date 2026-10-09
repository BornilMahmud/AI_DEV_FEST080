import { Router, Request, Response } from "express";
import { SupabaseClient } from "@supabase/supabase-js";
import { SecurityService } from "./security/security-service.js";
import { invokePythonMlService } from "./integrations/ml/mlService.js";
import { getClientIp } from "./security/ip-detection.js";

interface ServiceRiskParams {
  amount: number;
  recipient: string;
  senderName: string;
  serviceType: string;
  deviceId?: string;
  isNewDevice?: boolean;
  location?: string;
}

export function createMfsServicesRouter(
  supabase: SupabaseClient,
  securityService: SecurityService,
  evaluateAuthoritativeRisk: (txn: any, mlPrediction?: any) => any,
  localAlerts: any[],
  localTransactions: any[]
) {
  const router = Router();

  /**
   * Helper: Runs unified risk engine, Python ML, and decision policy.
   */
  async function runFinancialRiskCheck(req: Request, params: ServiceRiskParams) {
    const { amount, recipient, senderName, serviceType, deviceId, isNewDevice, location } = params;
    const txnId = `TXN-${serviceType.toUpperCase().slice(0, 4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 1. Invoke Python ML inference service
    const mlPrediction = await invokePythonMlService({
      id: txnId,
      amount,
      hour: new Date().getHours(),
      sender_name: senderName,
      recipient,
      receiver_name: recipient,
      isNewDevice: Boolean(isNewDevice),
      device: deviceId || "DEV-WEB-APP",
      location: location || "Dhaka",
      transaction_type: serviceType,
    });

    // 2. Authoritative Risk Fusion
    const assessment = evaluateAuthoritativeRisk(
      {
        id: txnId,
        amount,
        sender: senderName,
        recipient,
        device: deviceId || "DEV-WEB-APP",
        isNewDevice,
        location: location || "Dhaka",
        transaction_type: serviceType,
      },
      mlPrediction
    );

    return { txnId, mlPrediction, assessment };
  }

  async function safeInsert(table: string, payload: any) {
    try {
      await supabase.from(table).insert([payload]);
    } catch {
      // non-blocking persistence fallback
    }
  }

  // 1. POST /api/v1/services/send-money
  router.post("/send-money", async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { recipient, amount, note, deviceId, isNewDevice, pin } = req.body;
      const numAmount = Number(amount);

      if (!recipient || !numAmount || numAmount <= 0) {
        return res.status(400).json({ success: false, error: { message: "Valid recipient and positive amount required." } });
      }

      // 1. Fraud-First Risk Analysis (ML + Anomaly + Rule Engine)
      const ipDetails = getClientIp(req);
      const { txnId, mlPrediction, assessment } = await runFinancialRiskCheck(req, {
        amount: numAmount,
        recipient,
        senderName: user.email,
        serviceType: "send_money",
        deviceId,
        isNewDevice,
      });

      // 2. Decision Policy Enforcement
      if (assessment.riskLevel === "Critical" || assessment.finalScore >= 90) {
        // Block & Alert
        const alertId = `ALT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const alertPayload = {
          id: alertId,
          severity: "Critical",
          title: `Critical Risk Block on Send Money (${txnId})`,
          description: assessment.explanation,
          related_transaction_id: txnId,
          status: "OPEN",
          unread: true,
          created_at: new Date().toISOString(),
        };
        await safeInsert("alerts", alertPayload);
        localAlerts.unshift({ ...alertPayload, timeAgo: "Just now", iconType: "activity", confidence: assessment.confidence });

        await securityService.recordAuditEvent({
          actor: user.email,
          actorRole: user.role,
          action: "TRANSACTION_BLOCKED",
          entity: "transactions",
          entityId: txnId,
          reason: `High risk score (${assessment.finalScore}): ${assessment.explanation}`,
          requestId: req.requestId,
        });

        return res.status(403).json({
          success: false,
          status: "BLOCKED",
          transactionId: txnId,
          riskScore: assessment.finalScore,
          riskLevel: "Critical",
          message: "Transaction held by upay Sentinel Risk Engine due to anomalous risk indicators.",
          explanation: assessment.explanation,
          meta: { requestId: req.requestId },
        });
      }

      if (assessment.riskLevel === "High" || assessment.finalScore >= 75) {
        // Step-up 2FA required
        return res.status(202).json({
          success: false,
          status: "STEP_UP_REQUIRED",
          transactionId: txnId,
          riskScore: assessment.finalScore,
          riskLevel: "High",
          message: "Step-up two-factor authentication required for this transaction.",
          explanation: assessment.explanation,
          meta: { requestId: req.requestId },
        });
      }

      // 3. Balance Check & Settlement
      const wallet = await securityService.getWallet(user.id);
      if (Number(wallet.balance) < numAmount) {
        return res.status(400).json({
          success: false,
          error: { code: "INSUFFICIENT_FUNDS", message: `Insufficient balance. Available: ৳${Number(wallet.balance).toLocaleString()}` },
        });
      }

      // Allow: Update balance
      const updateRes = await securityService.updateWalletBalance(user.id, -numAmount);
      const txnRecord = {
        id: txnId,
        transaction_reference: txnId,
        sender_name: user.email,
        sender_phone_masked: "+880 17** ***" + Math.floor(100 + Math.random() * 900),
        receiver_name: recipient,
        receiver_phone_masked: recipient.startsWith("+880") ? recipient : `+880 ${recipient}`,
        amount: numAmount,
        currency: "BDT",
        transaction_type: "send_money",
        transaction_status: "completed",
        location: "Dhaka",
        created_at: new Date().toISOString(),
      };

      await safeInsert("transactions", txnRecord);
      localTransactions.unshift({
        ...txnRecord,
        timestamp: txnRecord.created_at,
        device_id: deviceId || "DEV-2211",
        device_new: Boolean(isNewDevice),
        beneficiary_new: false,
        ip_risk: 15,
        assessment: {
          final_risk_score: assessment.finalScore,
          risk_level: "low",
          confidence: assessment.confidence,
          explanation_summary: assessment.explanation,
          recommended_action: "ALLOW",
          ml_prediction: mlPrediction,
        },
      });

      await securityService.recordAuditEvent({
        actor: user.email,
        actorRole: user.role,
        action: "SEND_MONEY_COMPLETED",
        entity: "transactions",
        entityId: txnId,
        reason: `Send Money ৳${numAmount} to ${recipient} approved (Risk Score ${assessment.finalScore})`,
        requestId: req.requestId,
      });

      res.json({
        success: true,
        status: "COMPLETED",
        transaction: txnRecord,
        newBalance: updateRes.newBalance,
        wallet: {
          balance: updateRes.newBalance,
          newBalance: updateRes.newBalance,
        },
        riskScore: assessment.finalScore,
        riskLevel: assessment.riskLevel,
        riskAssessment: {
          overallScore: assessment.finalScore,
          decisionPolicy: assessment.riskLevel,
          confidence: assessment.confidence,
          explanation: assessment.explanation,
        },
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // 2. POST /api/v1/services/cash-out
  router.post("/cash-out", async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const agentNumber = req.body.agentNumber || req.body.agentPhone || req.body.recipient;
      const { amount, deviceId, isNewDevice } = req.body;
      const numAmount = Number(amount);
      const fee = Math.round(numAmount * 0.0149 * 100) / 100; // 1.49% agent fee
      const totalDeduction = numAmount + fee;

      if (!agentNumber || !numAmount || numAmount <= 0) {
        return res.status(400).json({ success: false, error: { message: "Valid agent number and amount required." } });
      }

      const wallet = await securityService.getWallet(user.id);
      if (Number(wallet.balance) < totalDeduction) {
        return res.status(400).json({
          success: false,
          error: { message: `Insufficient balance including fee (৳${fee}). Total needed: ৳${totalDeduction.toLocaleString()}` },
        });
      }

      const { txnId, assessment } = await runFinancialRiskCheck(req, {
        amount: numAmount,
        recipient: agentNumber,
        senderName: user.email,
        serviceType: "cash_out",
        deviceId,
        isNewDevice,
      });

      if (assessment.finalScore >= 90) {
        return res.status(403).json({
          success: false,
          status: "BLOCKED",
          transactionId: txnId,
          riskScore: assessment.finalScore,
          message: "Cash out held due to security threshold violation.",
          explanation: assessment.explanation,
        });
      }

      const updateRes = await securityService.updateWalletBalance(user.id, -totalDeduction);
      const txnRecord = {
        id: txnId,
        transaction_reference: txnId,
        sender_name: user.email,
        receiver_name: `Agent: ${agentNumber}`,
        amount: numAmount,
        fee,
        fee_amount: fee,
        currency: "BDT",
        transaction_type: "cash_out",
        transaction_status: "completed",
        location: "Dhaka",
        created_at: new Date().toISOString(),
      };
      await safeInsert("transactions", txnRecord);

      res.json({
        success: true,
        status: "COMPLETED",
        transaction: txnRecord,
        fee,
        newBalance: updateRes.newBalance,
        wallet: {
          balance: updateRes.newBalance,
          newBalance: updateRes.newBalance,
        },
        riskScore: assessment.finalScore,
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // 3. POST /api/v1/services/add-money (Demo Mode / Simulated Funding)
  router.post("/add-money", async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { channel, cardType, bankName, amount, cardNumber } = req.body;
      const numAmount = Number(amount);

      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ success: false, error: { message: "Valid deposit amount required." } });
      }

      const channelName = channel === "bank" ? (bankName || "City Bank Internet Banking") : `${cardType || "Visa Debit"} (${cardNumber ? "•••• " + cardNumber.slice(-4) : "•••• 4182"})`;
      const updateRes = await securityService.updateWalletBalance(user.id, numAmount);
      const txnId = `TXN-ADD-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const txnRecord = {
        id: txnId,
        transaction_reference: txnId,
        sender_name: channelName,
        receiver_name: user.email,
        amount: numAmount,
        currency: "BDT",
        transaction_type: "add_money",
        transaction_status: "completed",
        location: "Dhaka",
        created_at: new Date().toISOString(),
      };
      await safeInsert("transactions", txnRecord);

      await securityService.recordAuditEvent({
        actor: user.email,
        actorRole: user.role,
        action: "ADD_MONEY_COMPLETED",
        entity: "wallets",
        entityId: user.id,
        reason: `Funded ৳${numAmount} via ${channelName} (Simulation mode)`,
        requestId: req.requestId,
      });

      res.json({
        success: true,
        status: "COMPLETED",
        transaction: txnRecord,
        newBalance: updateRes.newBalance,
        wallet: {
          balance: updateRes.newBalance,
          newBalance: updateRes.newBalance,
        },
        isSimulation: true,
        disclaimer: "DEMO / SIMULATED TRANSACTION: In evaluation mode, card/bank gateway funding is simulated.",
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // 4. POST /api/v1/services/payment (Merchant / Online Payment)
  router.post("/payment", async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const merchantId = req.body.merchantId || req.body.merchantCode || req.body.merchantName || "MERCHANT-01";
      const { merchantName, amount, reference, isQr } = req.body;
      const numAmount = Number(amount);

      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ success: false, error: { message: "Valid payment amount required." } });
      }

      const wallet = await securityService.getWallet(user.id);
      if (Number(wallet.balance) < numAmount) {
        return res.status(400).json({ success: false, error: { message: "Insufficient balance for payment." } });
      }

      const { txnId, assessment } = await runFinancialRiskCheck(req, {
        amount: numAmount,
        recipient: merchantId,
        senderName: user.email,
        serviceType: "merchant_pay",
      });

      const updateRes = await securityService.updateWalletBalance(user.id, -numAmount);
      const txnRecord = {
        id: txnId,
        transaction_reference: txnId,
        sender_name: user.email,
        receiver_name: merchantName || `Merchant ${merchantId}`,
        amount: numAmount,
        currency: "BDT",
        transaction_type: isQr ? "qr_payment" : "merchant_pay",
        transaction_status: "completed",
        location: "Dhaka",
        created_at: new Date().toISOString(),
      };
      await safeInsert("transactions", txnRecord);

      res.json({
        success: true,
        status: "COMPLETED",
        transaction: txnRecord,
        newBalance: updateRes.newBalance,
        wallet: {
          balance: updateRes.newBalance,
          newBalance: updateRes.newBalance,
        },
        riskScore: assessment.finalScore,
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // 5. POST /api/v1/services/recharge (Mobile Airtime Recharge)
  router.post("/recharge", async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { phone, operator, amount, rechargeType } = req.body;
      const numAmount = Number(amount);

      if (!phone || !numAmount || numAmount <= 0) {
        return res.status(400).json({ success: false, error: { message: "Valid phone and amount required." } });
      }

      const wallet = await securityService.getWallet(user.id);
      if (Number(wallet.balance) < numAmount) {
        return res.status(400).json({ success: false, error: { message: "Insufficient balance for mobile recharge." } });
      }

      const updateRes = await securityService.updateWalletBalance(user.id, -numAmount);
      const txnId = `TXN-RCHG-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const txnRecord = {
        id: txnId,
        transaction_reference: txnId,
        sender_name: user.email,
        receiver_name: `${operator || "Telco"} Recharge (${phone})`,
        amount: numAmount,
        currency: "BDT",
        transaction_type: "recharge",
        transaction_status: "completed",
        location: "Dhaka",
        created_at: new Date().toISOString(),
      };
      await safeInsert("transactions", txnRecord);

      res.json({
        success: true,
        status: "COMPLETED",
        transaction: txnRecord,
        newBalance: updateRes.newBalance,
        wallet: {
          balance: updateRes.newBalance,
          newBalance: updateRes.newBalance,
        },
        isSimulation: true,
        disclaimer: "DEMO / SIMULATED TRANSACTION: Telecom carrier dispatch simulated.",
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // 6. POST /api/v1/services/pay-bill (Utility Bill Payment)
  router.post("/pay-bill", async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const billerName = req.body.billerName || req.body.billerCode || req.body.biller;
      const { billerCategory, accountNumber, amount, billMonth } = req.body;
      const numAmount = Number(amount);

      if (!billerName || !accountNumber || !numAmount || numAmount <= 0) {
        return res.status(400).json({ success: false, error: { message: "Valid biller, account, and amount required." } });
      }

      const wallet = await securityService.getWallet(user.id);
      if (Number(wallet.balance) < numAmount) {
        return res.status(400).json({ success: false, error: { message: "Insufficient balance for bill payment." } });
      }

      const updateRes = await securityService.updateWalletBalance(user.id, -numAmount);
      const txnId = `TXN-BILL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const txnRecord = {
        id: txnId,
        transaction_reference: txnId,
        sender_name: user.email,
        receiver_name: `${billerName} (${accountNumber})`,
        amount: numAmount,
        currency: "BDT",
        transaction_type: "pay_bill",
        transaction_status: "completed",
        location: "Dhaka",
        created_at: new Date().toISOString(),
      };
      await safeInsert("transactions", txnRecord);

      res.json({
        success: true,
        status: "COMPLETED",
        transaction: txnRecord,
        newBalance: updateRes.newBalance,
        wallet: {
          balance: updateRes.newBalance,
          newBalance: updateRes.newBalance,
        },
        isSimulation: true,
        disclaimer: "DEMO / SIMULATED TRANSACTION: Utility provider API dispatch simulated.",
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // 7. POST /api/v1/services/bank-transfer (Bank to Wallet / Wallet to Bank)
  router.post("/bank-transfer", async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { direction, bankName, accountName, accountNumber, amount } = req.body;
      const numAmount = Number(amount);

      if (!numAmount || numAmount <= 0 || !accountNumber) {
        return res.status(400).json({ success: false, error: { message: "Valid bank details and amount required." } });
      }

      const isWalletToBank = direction === "WALLET_TO_BANK";
      const wallet = await securityService.getWallet(user.id);

      if (isWalletToBank && Number(wallet.balance) < numAmount) {
        return res.status(400).json({ success: false, error: { message: "Insufficient balance for bank transfer." } });
      }

      const delta = isWalletToBank ? -numAmount : numAmount;
      const updateRes = await securityService.updateWalletBalance(user.id, delta);
      const txnId = `TXN-BNK-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const txnRecord = {
        id: txnId,
        transaction_reference: txnId,
        sender_name: isWalletToBank ? user.email : `${bankName} (${accountNumber})`,
        receiver_name: isWalletToBank ? `${bankName} (${accountNumber})` : user.email,
        amount: numAmount,
        currency: "BDT",
        transaction_type: isWalletToBank ? "wallet_to_bank" : "bank_to_wallet",
        transaction_status: "completed",
        location: "Dhaka",
        created_at: new Date().toISOString(),
      };
      await safeInsert("transactions", txnRecord);

      res.json({
        success: true,
        status: "COMPLETED",
        transaction: txnRecord,
        newBalance: updateRes.newBalance,
        wallet: {
          balance: updateRes.newBalance,
          newBalance: updateRes.newBalance,
        },
        isSimulation: true,
        disclaimer: "DEMO / SIMULATED TRANSACTION: BEFTN/NPSB bank gateway settlement simulated.",
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // 8. POST /api/v1/services/remittance (Foreign Inward Remittance Claim)
  router.post("/remittance", async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { referenceCode, senderCountry, senderName, amount } = req.body;
      const numAmount = Number(amount || 25000);

      if (!referenceCode) {
        return res.status(400).json({ success: false, error: { message: "Valid 16-digit remittance reference PIN required." } });
      }

      const updateRes = await securityService.updateWalletBalance(user.id, numAmount);
      const txnId = `TXN-REMIT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const txnRecord = {
        id: txnId,
        transaction_reference: txnId,
        sender_name: `${senderName || "Expatriate Remitter"} (${senderCountry || "Saudi Arabia"})`,
        receiver_name: user.email,
        amount: numAmount,
        currency: "BDT",
        transaction_type: "remittance",
        transaction_status: "completed",
        location: "Dhaka",
        created_at: new Date().toISOString(),
      };
      await safeInsert("transactions", txnRecord);

      res.json({
        success: true,
        status: "COMPLETED",
        transaction: txnRecord,
        newBalance: updateRes.newBalance,
        wallet: {
          balance: updateRes.newBalance,
          newBalance: updateRes.newBalance,
        },
        isSimulation: true,
        disclaimer: "DEMO / SIMULATED TRANSACTION: Inward exchange house remittance simulated with 2.5% incentive.",
        meta: { requestId: req.requestId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  return router;
}
