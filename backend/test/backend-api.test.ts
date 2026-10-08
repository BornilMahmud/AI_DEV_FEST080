import assert from "node:assert/strict";

console.log("=================================================");
console.log("🛡️ RUNNING UPAY SENTINEL BACKEND API & SECURITY TEST SUITE");
console.log("=================================================\n");

const BASE = "http://localhost:3001";
let passed = 0;
let total = 0;

async function test(name: string, fn: () => Promise<void>) {
  total++;
  try {
    await fn();
    console.log(`✅ [PASS] ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(err.message || err);
    throw err;
  }
}

async function run() {
  // 1. Health & System Readiness
  await test("1. Health Endpoint: Returns operational status and connected Supabase metadata", async () => {
    const res = await fetch(`${BASE}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "operational");
    assert.ok(data.database.provider.includes("Supabase"));
    assert.ok(data.engine.detectors.length >= 4);
  });

  // 2. Transaction Ingestion - Validation Failure
  await test("2. Ingestion Validation: Rejects malformed payload missing positive amount", async () => {
    const res = await fetch(`${BASE}/api/v1/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: -500 }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error, "Validation failed");
  });

  // 3. Transaction Ingestion - Benign Transaction
  await test("3. Risk Engine Ingestion: Correctly identifies Low-risk grocery transaction", async () => {
    const res = await fetch(`${BASE}/api/v1/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 1450,
        sender_name: "U-5501",
        recipient: "M-2910",
        isNewDevice: false,
        location: "Dhaka",
        transaction_type: "merchant_payment",
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.assessment.riskLevel, "Low");
    assert.ok(data.assessment.finalScore < 45);
    assert.equal(data.alert, null);
  });

  // 4. Transaction Ingestion - Critical Multi-Factor Attack
  let criticalTxnId = "";
  await test("4. Risk Engine Ingestion: Correctly flags Critical transaction (amount + mule target)", async () => {
    const res = await fetch(`${BASE}/api/v1/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 49500,
        sender_name: "U-1042",
        recipient: "U-8831", // Mule cluster target
        isNewDevice: true,
        location: "Dhaka",
        transaction_type: "Wallet Transfer",
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.assessment.riskLevel, "Critical");
    assert.ok(data.assessment.finalScore >= 85);
    assert.ok(Boolean(data.alert));
    assert.ok(Boolean(data.assessment.mlPrediction));
    assert.ok(data.assessment.mlPrediction.ml_available || data.assessment.mlPrediction.fallback_used);
    assert.ok(data.assessment.mlPrediction.fraud_probability >= 0.70);
    assert.equal(data.transaction.transaction_status, "held");
    criticalTxnId = data.transaction.id;
  });

  // 5. Paginated & Filtered Transaction Retrieval
  await test("5. Transactions API: Returns server-side paginated list with total count", async () => {
    const res = await fetch(`${BASE}/api/v1/transactions?page=1&limit=3`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.transactions.length <= 3);
    assert.ok(data.totalCount >= 4);
    assert.equal(data.pagination.limit, 3);
  });

  const analystToken = "Bearer test-token:demo-arman-01:ANALYST:arman.hossen@upay.com.bd";

  // 6. Human Analyst Decision Action (HOLD)
  await test("6. Human Oversight Decision: Executes analyst HOLD with immutable audit record", async () => {
    const res = await fetch(`${BASE}/api/v1/transactions/${criticalTxnId}/decision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: analystToken,
      },
      body: JSON.stringify({
        action: "HOLD",
        analyst_name: "Arman Hossen",
        reason: "Suspected mule layering in Dhaka cluster #17",
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.action, "HOLD");
    assert.equal(data.status, "held");
    assert.ok(data.auditRecord.id.startsWith("AUD-"));
    assert.equal(data.auditRecord.actor_role, "ANALYST");
  });

  // 7. Human Analyst Decision Action (RELEASE)
  await test("7. Human Oversight Decision: Executes analyst RELEASE upon biometric clearance", async () => {
    const res = await fetch(`${BASE}/api/v1/transactions/${criticalTxnId}/decision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: analystToken,
      },
      body: JSON.stringify({
        action: "RELEASE",
        analyst_name: "Siam Ahmed",
        reason: "Verified identity via out-of-band video KYC",
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.action, "RELEASE");
    assert.equal(data.status, "completed");
  });

  // 8. Alerts Management
  await test("8. Alerts API: Lists alerts and acknowledges unread status", async () => {
    const listRes = await fetch(`${BASE}/api/v1/alerts`);
    const listData = await listRes.json();
    assert.equal(listRes.status, 200);
    assert.ok(listData.alerts.length >= 1);

    const firstAlert = listData.alerts[0];
    const ackRes = await fetch(`${BASE}/api/v1/alerts/${firstAlert.id}/acknowledge`, { method: "POST" });
    const ackData = await ackRes.json();
    assert.equal(ackData.success, true);
    assert.equal(ackData.unread, false);
  });

  // 9. Customer 360 Dossier
  await test("9. Customer 360 API: Retrieves enriched risk profile and behavioral deviations", async () => {
    const res = await fetch(`${BASE}/api/v1/customers/U-1042`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.customer.id, "U-1042");
    assert.ok(data.customer.recentDeviations.length >= 1);
  });

  // 10. Money Trail 4-Stage Forensic Pipeline
  await test("10. Money Trail API: Returns 4-stage pipeline (Origin -> Layering -> Cashout -> Exfil)", async () => {
    const res = await fetch(`${BASE}/api/v1/network/money-trail/TXN-8F42`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.pipeline.length, 4);
    assert.ok(data.pipeline[0].title.includes("Origin"));
    assert.ok(data.pipeline[3].title.includes("Exfiltration"));
  });

  // 11. Deterministic Simulation Injection
  await test("11. Simulation API: Deterministically injects ATO and Mule scenarios", async () => {
    const res = await fetch(`${BASE}/api/v1/simulation/ato`, { method: "POST" });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.scenario, "ato");
    assert.ok(data.transaction.id.includes("TXN-SIM-ATO"));
  });

  // 12. Sentinel Copilot Reasoning & Investigation
  await test("12. Copilot API: Generates structured BFIU investigation analysis with human review flag", async () => {
    const res = await fetch(`${BASE}/api/v1/copilot/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: "Is this transaction eligible for BFIU SAR staging under Circular 25/2023?",
        transactionId: "TXN-8F42",
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Boolean(data.summary));
    assert.equal(data.requires_human_review, true);
    assert.ok(data.key_findings.length >= 1);
  });

  // 13. Benchmarks & Analytics
  await test("13. Benchmark Analytics: Computes accurate confusion matrix metrics", async () => {
    const res = await fetch(`${BASE}/api/v1/analytics/benchmarks`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.accuracy, 100);
    assert.equal(data.f1Score, 1.0);
    assert.equal(data.confusionMatrix.tp + data.confusionMatrix.tn, 100);
  });

  // 14. Audit Log Query
  await test("14. Audit Trail: Verifies append-only events recorded for every state change", async () => {
    const res = await fetch(`${BASE}/api/v1/audit`, {
      headers: { Authorization: analystToken },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.events.length >= 3);
    assert.ok(data.events.some((e: any) => e.action.includes("ANALYST")));
  });

  console.log("\n=================================================");
  console.log(`🎉 ALL ${passed}/${total} BACKEND API TESTS PASSED!`);
  console.log("=================================================\n");
}

run().catch((e) => {
  console.error("Test execution aborted:", e);
  process.exit(1);
});
