# UPAY SENTINEL — Project State & Architectural Specification

**Platform Status:** Operational (Two-Sided MFS Ecosystem: Customer Upay Wallet + Enterprise Fraud Control Center)  
**Revision:** v2.0.0 (Hackathon Enterprise Release)  
**Compliance Bar:** Bangladesh Bank BFIU Circular 25/2023, ISO 27001 Data Separation, OWASP Top 10  

---

## 1. System Topology & Dual-Portal Architecture

```
                       UPAY SENTINEL
                             │
            ┌────────────────┴────────────────┐
            │                                 │
     CUSTOMER PORTAL                   ADMIN CENTER
     (Upay MFS Wallet)             (Security & Fraud SOC)
            │                                 │
            ↓                                 ↓
     • Available Balance (৳)           • Enterprise Overview
     • Send Money                      • Transaction Monitor
     • Cash Out (1.49% Fee)            • Risk Intelligence
     • Add Money (Demo)                • Fraud Ring Graph
     • Merchant Payment                • Alert Center
     • Mobile Recharge (5 Telcos)      • Case Investigations
     • Pay Bill (Utilities)            • Customer Risk 360
     • Bank Transfer (NPSB)            • ML Model Registry
     • Inbound Remittance              • Dataset Governance
     • Bangla QR Payment               • System Health & Latencies
     • Transaction Receipts            • Audit Trail (Append-Only)
     • Security Center (Observed IP)   • IP & Device Intelligence
            │                                 │
            └────────────────┬────────────────┘
                             ↓
                      EXPRESS REST API
                     (Port 3001 • v5.2.1)
                             │
     ┌───────────────────────┴───────────────────────┐
     │                                               │
AUTHENTICATION & RBAC                       FRAUD-FIRST RISK PIPELINE
• Firebase ID Token Verification            • Request Validation & Idempotency
• Server-Observed Client IP (No spoofing)   • Behavioral & Velocity Features
• Device Fingerprint & Session Registry     • Python ML Inference (Port 8000)
• Profiles Role RBAC (CUSTOMER, ADMIN,      • Scikit HistGradientBoosting
  ANALYST, INVESTIGATOR, VIEWER)            • Scikit IsolationForest Anomaly
                                            • PyTorch SentinelMLP
                                            • Rule Engine (BB Circular Rules)
                                            • Risk Fusion (70% Rule + 30% ML)
                                            • Decision Policy (ALLOW/STEP-UP/HOLD)
                             │
                             ↓
                    SUPABASE POSTGRESQL
              (AWS ap-northeast-2 Seoul Pooler)
      • wallets               • beneficiaries       • user_devices
      • ml_models             • datasets            • risk_policies
      • profiles              • login_sessions      • login_ip_history
      • security_events       • customers           • transactions
      • risk_assessments      • alerts              • investigation_cases
      • audit_events          • case_notes          • evidence_items
      • network_nodes         • network_edges
```

---

## 2. Supabase Database Schema (20 Active PostgreSQL Tables)

All 20 tables are created, indexed, and actively connected via the `aws-0-ap-northeast-2.pooler.supabase.com:6543` connection pooler:

1. **`wallets`**: Balances in BDT, daily/monthly limits, KYC status.
2. **`beneficiaries`**: Saved recipients, nicknames, account linkages.
3. **`user_devices`**: Browser fingerprints, device classes, trust scores, first/last seen.
4. **`ml_models`**: Model registry, versions (`v1.2.0`, `v2.0.0-rc1`), Precision, Recall, F1, PR-AUC, ROC-AUC, statuses (`ACTIVE`, `STAGED`, `RETIRED`).
5. **`datasets`**: Training metadata, transaction counts, fraud counts, splits, leakage validation.
6. **`risk_policies`**: Tunable thresholds, alert severity cutoffs, versioning, change reasons.
7. **`profiles`**: RBAC accounts with role constraint `('CUSTOMER', 'ADMIN', 'ANALYST', 'INVESTIGATOR', 'VIEWER')`.
8. **`login_sessions`**: Active sessions, device tracking, revocation status.
9. **`login_ip_history`**: Historical login telemetry, counts, first/last observed.
10. **`security_events`**: Append-only security audit events (new IP, token rejection, anomalous device).
11. **`customers`**: Risk profiles, behavioral baseline metrics, mule cluster flags.
12. **`transactions`**: Financial records, fees, channels, amounts, status.
13. **`risk_assessments`**: Fusion scores, deterministic subscores, ML model inference metadata.
14. **`alerts`**: SOC alerts, severity, confidence, resolution workflow.
15. **`investigation_cases`**: Analyst casework, status, assigned investigators.
16. **`audit_events`**: Append-only compliance audit trail.
17. **`case_notes`**: Case documentation and analyst notes.
18. **`evidence_items`**: Case evidence, transaction attachments, network graphs.
19. **`network_nodes`**: Graph visualization nodes (wallets, agents, IP clusters).
20. **`network_edges`**: Money trail flows, fan-out relationships, cycle detection.

---

## 3. API Contract Reference

### Customer Endpoints (`/api/v1/me`)
- `GET /api/v1/me`: Profile, wallet summary, security status.
- `GET /api/v1/me/wallet`: Current balance, limits, currency (BDT).
- `GET /api/v1/me/transactions`: Customer's own transactions with pagination and type filtering.
- `GET /api/v1/me/security`: Current observed login IP, approximate location, device details.
- `GET /api/v1/me/sessions`: Active sessions list.
- `POST /api/v1/me/sessions/revoke-others`: Revoke other active login sessions.
- `GET /api/v1/me/devices`: Registered user hardware devices.

### MFS Financial Services (`/api/v1/services`)
- `POST /api/v1/services/send-money`: Wallet-to-wallet transfer with fraud risk scoring.
- `POST /api/v1/services/cash-out`: Agent cash withdrawal with 1.49% fee calculation.
- `POST /api/v1/services/add-money`: Simulated Bank/Card wallet deposit.
- `POST /api/v1/services/payment`: Merchant checkout and POS payment.
- `POST /api/v1/services/recharge`: Mobile airtime recharge for 5 Bangladesh carriers.
- `POST /api/v1/services/pay-bill`: Utility bill payments (DPDC, DESCO, WASA, Titas, ISPs).
- `POST /api/v1/services/bank-transfer`: Wallet to Bank account transfer (NPSB).
- `POST /api/v1/services/remittance`: Inbound remittance processing and currency conversion.

### Admin & Governance Endpoints (`/api/v1/admin`)
- `GET /api/v1/admin/users`: User management list and role filters.
- `GET /api/v1/admin/models`: ML Model registry and version metadata.
- `POST /api/v1/admin/models/:id/deploy`: Model promotion and deployment governance.
- `GET /api/v1/admin/datasets`: Training dataset metadata and leakage verification.
- `GET /api/v1/admin/policies`: Configured risk policies and threshold limits.
- `PUT /api/v1/admin/policies/:id`: Audited risk threshold calibration with reason requirement.
- `GET /api/v1/admin/system-health`: Live operational telemetry for Express, Supabase, ML service, and Gemini.

---

## 4. Test Suite Verification

### Backend Tests: 25/25 Passing
- `backend/test/backend-api.test.ts`: 14/14 tests passing.
- `backend/test/mfs-customer-ecosystem.test.ts`: 11/11 tests passing.

### Frontend Compilation:
- `npx.cmd tsc --noEmit`: 0 errors.
- Next.js dev server on port 3000: Operational, HTTP 200.

---

## 5. Security & Privacy Guarantees

1. **Server-Observed IP Only:** Client IP is extracted strictly via `req.ip` and reverse proxy headers (`x-forwarded-for`). Browser submissions of IP are disregarded.
2. **Privacy Terminology:** All user-facing references state *"Current observed login IP"* and optional *"Approximate IP-based network location"*. Exact physical street addresses are never claimed or fabricated.
3. **Fair Authentication:** Zero preset login buttons or bypass shortcuts exist on `LoginPage.tsx`. Authentication requires genuine Firebase credentials (Email/Password, Google OAuth).
4. **Simulation Transparency:** All mock external banking and telco gateways are explicitly disclaimed as *"DEMO / SIMULATION"* in the UI and API payload responses.

---

## 6. Motion & Visual Polish System (v2.1.0)

1. **Global Purple Pointer Spotlight:**
   - **Settings:** Medium Glow (340px), Purple theme (`rgba(168, 85, 247, ...)`), Lights Edges ON, Short Lag (80ms cubic-bezier transition).
   - **Performance:** Move light using GPU transforms only (`translate3d(x, y, 0)`), no layout reflows (top/left/width/height untouched), zero React state re-renders during pointer tracking.
   - **Edge Illumination:** Closest edges illuminate via dual CSS radial mask overlay (`maskComposite: "exclude"`), far edges remain dim.
   - **Touch Dragging:** Supported via passive touch listeners without interfering with page scrolling (`touchAction: "pan-y"`).
   - **Accessibility:** Snaps immediately with zero lag/glide when `prefers-reduced-motion` is enabled.

2. **Enterprise Motion Primitives & Transitions:**
   - Standardized tokens: `fast` (120ms), `normal` (200ms), `emphasis` (300ms) with `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Tactile button and card interactions (`.hover-lift`, `.press-down`, `.card-surface`).
   - Risk score transitions via `AnimatedNumber` with tab-numeric monospace precision.
   - Non-layout-shifting `Skeleton` shimmer loading primitives.
   - 2D Money Trail animated flow beams (`.edge-flow`) and focused node halo pulses (`.animate-statusPulse`).

3. **Strict Invariants Preserved:**
   - Backend logic, database schemas, ML services, APIs, and authentication flow remain 100% untouched and operational.

