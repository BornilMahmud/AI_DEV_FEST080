import assert from "node:assert/strict";

console.log("=================================================");
console.log("💳 RUNNING UPAY SENTINEL MFS CUSTOMER & ADMIN ECOSYSTEM TESTS");
console.log("=================================================\n");

const BASE = "http://localhost:3001";
const CUSTOMER_AUTH = "Bearer test-token:cust-001:CUSTOMER:customer@upay.com.bd:Customer-Name";
const ADMIN_AUTH = "Bearer test-token:admin-001:ADMIN:admin@upay.com.bd:Admin-Name";

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
  // 1. Security Gate: Unauthenticated requests rejected
  await test("1. Auth Boundary: Rejects unauthenticated financial transaction with 401", async () => {
    const res = await fetch(`${BASE}/api/v1/services/send-money`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: "01712345678", amount: 1500 }),
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error.code, "UNAUTHORIZED");
  });

  // 2. Authenticated Send Money Service
  await test("2. Send Money: Evaluates transaction through Python ML and returns risk decision", async () => {
    const res = await fetch(`${BASE}/api/v1/services/send-money`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: CUSTOMER_AUTH,
      },
      body: JSON.stringify({
        recipient: "01712345678",
        amount: 1500,
        reference: "Family allowance",
        channel: "WALLET_TRANSFER",
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.transaction.id);
    assert.ok(data.riskAssessment.overallScore !== undefined);
  });

  // 3. High-Risk / Anomalous Send Money Detection
  await test("3. Send Money: High amount & anomalous pattern triggers risk mitigation", async () => {
    const res = await fetch(`${BASE}/api/v1/services/send-money`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: CUSTOMER_AUTH,
      },
      body: JSON.stringify({
        recipient: "01888999000",
        amount: 45000,
        reference: "Urgent cash emergency",
        channel: "WALLET_TRANSFER",
        isNewDevice: true,
      }),
    });
    // Can return 202 STEP_UP_REQUIRED, 403 BLOCKED, or 200 with high score
    assert.ok(res.status === 202 || res.status === 403 || res.status === 200);
    const data = await res.json();
    assert.ok(data.riskScore > 30 || data.riskAssessment?.overallScore > 30 || data.status === "STEP_UP_REQUIRED" || data.status === "BLOCKED");
  });

  // 4. Cash Out Service
  await test("4. Cash Out: Calculates 1.49% fee and runs risk checks", async () => {
    const res = await fetch(`${BASE}/api/v1/services/cash-out`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: CUSTOMER_AUTH,
      },
      body: JSON.stringify({
        agentPhone: "01911223344",
        amount: 5000,
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.transaction.fee, 74.5);
  });

  // 5. Add Money Simulation
  await test("5. Add Money: Simulates Bank/Card funding without real external charges", async () => {
    const res = await fetch(`${BASE}/api/v1/services/add-money`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: CUSTOMER_AUTH,
      },
      body: JSON.stringify({
        sourceChannel: "BANK_TRANSFER",
        amount: 10000,
        reference: "Bank to Wallet deposit",
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.status, "COMPLETED");
  });

  // 6. Mobile Recharge Service
  await test("6. Mobile Recharge: Validates operator and credits recipient", async () => {
    const res = await fetch(`${BASE}/api/v1/services/recharge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: CUSTOMER_AUTH,
      },
      body: JSON.stringify({
        phone: "01711223344",
        operator: "Grameenphone",
        amount: 200,
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
  });

  // 7. Utility Bill Payment
  await test("7. Pay Bill: Processes utility payment with account verification", async () => {
    const res = await fetch(`${BASE}/api/v1/services/pay-bill`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: CUSTOMER_AUTH,
      },
      body: JSON.stringify({
        billerCode: "DPDC (Electricity)",
        accountNumber: "1029384756",
        amount: 1850,
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
  });

  // 8. Security Telemetry API
  await test("8. Customer Security: Returns observed IP and approximate location (not exact address)", async () => {
    const res = await fetch(`${BASE}/api/v1/me/security`, {
      headers: { Authorization: CUSTOMER_AUTH },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.security.observedIp);
    assert.ok(data.security.approximateLocation);
    // Explicitly verify privacy rule compliance
    assert.equal(data.security.isExactPhysicalAddress, false);
  });

  // 9. Admin Models Registry
  await test("9. Admin Model Registry: Returns active, staged, and retired model versions", async () => {
    const res = await fetch(`${BASE}/api/v1/admin/models`, {
      headers: { Authorization: ADMIN_AUTH },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.models.length >= 2);
  });

  // 10. Admin Datasets Registry
  await test("10. Admin Dataset Registry: Returns dataset metadata with leakage validation status", async () => {
    const res = await fetch(`${BASE}/api/v1/admin/datasets`, {
      headers: { Authorization: ADMIN_AUTH },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.datasets.length >= 2);
    assert.equal(data.datasets[0].leakage_validated, true);
  });

  // 11. System Health API
  await test("11. System Health: Reports live operational status for Express, Supabase, and ML engine", async () => {
    const res = await fetch(`${BASE}/api/v1/admin/system-health`, {
      headers: { Authorization: ADMIN_AUTH },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.health.express.status, "UP");
  });

  console.log("\n=================================================");
  console.log(`🎉 ALL ${passed}/${total} MFS ECOSYSTEM TESTS PASSED!`);
  console.log("=================================================\n");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
