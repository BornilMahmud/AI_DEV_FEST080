import { describe, it } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = "http://localhost:3001";

// Helper for test tokens
function createTestToken(uid: string, role: string, email?: string): string {
  return `test-token:${uid}:${role}:${email || `${uid}@upay.com.bd`}`;
}

async function runSecurityAuditSuite() {
  console.log("==============================================================================");
  console.log(" UPAY SENTINEL — COMPREHENSIVE SECOND SECURITY AUDIT & VERIFICATION SUITE");
  console.log("==============================================================================");

  let passed = 0;
  let failed = 0;

  async function check(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // ----------------------------------------------------------------------------
  // SECTION 1: AUTHENTICATION & TOKEN INTEGRITY TESTS
  // ----------------------------------------------------------------------------
  console.log("\n--- 1. Authentication & Token Integrity Tests ---");

  await check("Reject unauthenticated request to /api/v1/security/events with 401", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/security/events`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, "UNAUTHORIZED");
  });

  await check("Reject request with malformed Bearer token with 401", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/security/events`, {
      headers: { Authorization: "Bearer this-is-not-a-valid-token" },
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  await check("Reject request missing Bearer prefix with 401", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/security/events`, {
      headers: { Authorization: "Basic dXNlcjpwYXNz" },
    });
    assert.equal(res.status, 401);
  });

  await check("Reject session sync without token with 400", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, "MISSING_TOKEN");
  });

  // ----------------------------------------------------------------------------
  // SECTION 2: ROLE-BASED ACCESS CONTROL (RBAC) & PRIVILEGE ESCALATION
  // ----------------------------------------------------------------------------
  console.log("\n--- 2. Role-Based Access Control (RBAC) & Privilege Escalation ---");

  const viewerToken = createTestToken("test-viewer-01", "VIEWER", "viewer@upay.com.bd");
  const investigatorToken = createTestToken("test-inv-01", "INVESTIGATOR", "siam.ahmed@upay.com.bd");
  const analystToken = createTestToken("test-analyst-01", "ANALYST", "arman.hossen@upay.com.bd");
  const adminToken = createTestToken("test-admin-01", "ADMIN", "judge@upay.com.bd");

  await check("Reject VIEWER role from executing analyst decision with 403", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/transactions/TXN-8F42/decision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${viewerToken}`,
      },
      body: JSON.stringify({ decision: "HOLD", notes: "Viewer attempting hold" }),
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, "FORBIDDEN");
  });

  await check("Reject INVESTIGATOR role from executing settlement decision with 403", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/transactions/TXN-8F42/decision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${investigatorToken}`,
      },
      body: JSON.stringify({ decision: "RELEASE", notes: "Investigator attempting release" }),
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.error.code, "FORBIDDEN");
  });

  await check("Reject VIEWER role from accessing sensitive security telemetry with 403", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/security/events`, {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.error.code, "FORBIDDEN");
  });

  await check("Reject VIEWER role from accessing user IP history with 403", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/security/users/test-analyst-01/ip-history`, {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    assert.equal(res.status, 403);
  });

  await check("Allow authorized ANALYST role to execute decision with 200", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/transactions/TXN-8F42/decision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${analystToken}`,
      },
      body: JSON.stringify({ decision: "HOLD", notes: "Analyst confirmed fraud suspicion" }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.action, "HOLD");
    assert.equal(body.auditRecord.actor_role, "ANALYST");
  });

  await check("Allow authorized ADMIN role to access security events with 200", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/security/events`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.events));
  });

  // ----------------------------------------------------------------------------
  // SECTION 3: IP TRACKING, IP CHANGE DETECTION & SESSION MANAGEMENT
  // ----------------------------------------------------------------------------
  console.log("\n--- 3. IP Tracking, IP Change Detection & Session Lifecycle ---");

  const testUserUid = `audit-user-${Date.now()}`;
  const testUserEmail = `audit-${Date.now()}@upay.com.bd`;
  const initialToken = createTestToken(testUserUid, "ANALYST", testUserEmail);

  let firstSessionData: any = null;

  await check("1st Login: Register profile and record initial observed IP", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${initialToken}`,
        "X-Forwarded-For": "103.205.180.20", // Simulating incoming IP A
      },
      body: JSON.stringify({ deviceFingerprint: "HARDWARE-SAMSUNG-S23" }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.user.email, testUserEmail);
    assert.equal(body.session.ipChanged, false);
    assert.equal(body.session.newIpDetected, true);
    assert.equal(body.session.securityRisk, "NORMAL");
    firstSessionData = body;
  });

  await check("2nd Login: Same IP updates login count and DOES NOT trigger IP change event", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${initialToken}`,
        "X-Forwarded-For": "103.205.180.20", // Same IP A
      },
      body: JSON.stringify({ deviceFingerprint: "HARDWARE-SAMSUNG-S23" }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.session.ipChanged, false);
    assert.equal(body.session.newIpDetected, false);
    assert.equal(body.session.securityRisk, "NORMAL");
  });

  await check("3rd Login: Different IP detects change, flags change_detected=true, generates security event", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${initialToken}`,
        "X-Forwarded-For": "182.160.100.55", // New observed IP B!
      },
      body: JSON.stringify({ deviceFingerprint: "HARDWARE-SAMSUNG-S23" }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.session.ipChanged, true);
    assert.equal(body.session.newIpDetected, true);
    assert.equal(body.session.previousIp, "103.205.180.20");
    assert.ok(body.session.securityEventId);
    assert.ok(body.session.auditEventId);
  });

  await check("4th Login: New IP + New Hardware Fingerprint assigns elevated risk (MEDIUM/HIGH)", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${initialToken}`,
        "X-Forwarded-For": "45.127.248.10", // Novel IP C
      },
      body: JSON.stringify({ deviceFingerprint: "NOVEL-UNRECOGNIZED-IPHONE15" }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.session.ipChanged, true);
    assert.ok(["MEDIUM", "HIGH"].includes(body.session.securityRisk));
  });

  await check("Verify IP History contains both IPs and does not delete prior records", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/security/users/${firstSessionData.user.id}/ip-history`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.history.length >= 2, `Expected at least 2 IP records, got ${body.history.length}`);
    const ips = body.history.map((h: any) => h.ip_address);
    assert.ok(ips.includes("103.205.180.20"), "Must contain first IP");
    assert.ok(ips.includes("182.160.100.55"), "Must contain second IP");
  });

  // ----------------------------------------------------------------------------
  // SECTION 4: ANTI-SPOOFING & INPUT INJECTION TESTS
  // ----------------------------------------------------------------------------
  console.log("\n--- 4. Anti-Spoofing & Injection Defense Tests ---");

  await check("Anti-Spoofing: Client cannot override detected IP via JSON request body", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${initialToken}`,
      },
      // Attacker tries to forge public IP in body
      body: JSON.stringify({ ip_address: "8.8.8.8", client_ip: "1.1.1.1" }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.notEqual(body.session.currentIp, "8.8.8.8", "Server must NOT accept client body ip_address");
    assert.notEqual(body.session.currentIp, "1.1.1.1", "Server must NOT accept client body client_ip");
  });

  await check("SQL Injection in parameters is safely resisted", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/transactions/' OR '1'='1`);
    assert.equal(res.status, 404);
  });

  await check("Invalid transaction amount rejected with 400", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: -500, customer: "U-1001" }),
    });
    assert.equal(res.status, 400);
  });

  // ----------------------------------------------------------------------------
  // SECTION 5: DO NOT OVERCLAIM EXACT LOCATION
  // ----------------------------------------------------------------------------
  console.log("\n--- 5. Scientific Accuracy & Privacy Standards ---");

  await check("Telemetry explicitly labeled as 'Observed login IP address' (no fake physical location)", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/security/users/${firstSessionData.user.id}/profile`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.profile.ipDescription.includes("Observed login IP address"));
    assert.equal(body.profile.latitude, undefined);
    assert.equal(body.profile.longitude, undefined);
  });

  console.log("\n==============================================================================");
  console.log(` AUDIT SUMMARY: TOTAL=${passed + failed} | PASSED=${passed} | FAILED=${failed}`);
  console.log("==============================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAuditSuite();
