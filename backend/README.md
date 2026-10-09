# upay Sentinel — Authoritative Backend Risk Intelligence Layer

Enterprise Risk & Trust Intelligence Backend for Mobile Financial Services (MFS) in Bangladesh, built for the **DIU CPC × upay AI Hackathon 2026**.

---

## ⚡ Tech Stack & Architecture

- **Runtime & Server**: Node.js + Express 5 + TypeScript + `tsx`
- **Database**: Supabase PostgreSQL (`https://xhgxmsgsxqpffzmpehtn.supabase.co`) with Row Level Security (RLS) & PostgREST
- **Authentication**: Firebase Auth (Email/Password, Google OAuth) + Supabase profile synchronization
- **AI & Copilot**: Google Gemini (`@google/genai` / `@google/generative-ai` with structured investigation reasoning and deterministic fallback)
- **Authoritative Risk Engine**: Multi-Detector Pipeline (Behavioral Baseline, Velocity Burst, ATO/USSD Pin Reset, Mule Ring Syndicate Cluster #17, Bangladesh Bank Circular Compliance Rules, and ML Calibration)

---

## 🚀 Getting Started

### 1. Environment Configuration
Verify `backend/.env` has:
```env
PORT=3001
SUPABASE_URL=https://xhgxmsgsxqpffzmpehtn.supabase.co
SUPABASE_SECRET_KEY=your_supabase_secret_key_here
SUPABASE_PUBLISHABLE_KEY=sb_publishable_AW3O9YE91ne_eg66F4et9g_U7w3crxi
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### 2. Database Schema
Execute [`backend/supabase/unified_schema.sql`](./supabase/unified_schema.sql) in your Supabase Dashboard SQL Editor to establish:
- `profiles`
- `customers`
- `transactions`
- `risk_assessments`
- `alerts`
- `investigation_cases`
- `case_notes`
- `evidence_items`
- `audit_events`
- `network_nodes`
- `network_edges`
- `simulation_runs`

### 3. Run Server & Tests
```bash
# Start backend server
npm run dev

# Run automated backend API & security test suite (14/14 tests)
npm test

# Run core risk engine test suite (13/13 tests from root)
cd .. && npm test
```

Server runs on: **`http://localhost:3001`**

---

## 📡 API Endpoints Matrix

| Method | Endpoint | Description | Auth / Governance | Status |
|---|---|---|---|---|
| `GET` | `/api/health` | Health check & Supabase connection telemetry | Public | Operational |
| `GET` | `/ready` | Process readiness & uptime probe | Public | Operational |
| `POST` | `/api/v1/transactions` | Ingest transaction through 6-detector risk pipeline | Zod Validated | Operational |
| `GET` | `/api/v1/transactions` | Server-side paginated & filtered transactions | Analyst / Admin | Operational |
| `GET` | `/api/v1/transactions/:id` | Detailed transaction record with full assessment | Analyst / Admin | Operational |
| `GET` | `/api/v1/transactions/:id/risk` | Isolated risk signals, rule hits, and XAI factors | Analyst / Admin | Operational |
| `GET` | `/api/v1/transactions/:id/audit`| Transaction audit trail with actor records | Audit / Investigator | Operational |
| `POST` | `/api/v1/transactions/:id/decision` | Human Analyst Action (`HOLD`, `STEP_UP`, `ESCALATE`, `MARK_SAFE`, `RELEASE`) | Human-in-the-Loop | Operational |
| `GET` | `/api/v1/alerts` | Active fraud alert queue with unread status | Analyst | Operational |
| `POST` | `/api/v1/alerts/:id/acknowledge` | Acknowledge alert | Analyst | Operational |
| `POST` | `/api/v1/alerts/:id/resolve` | Resolve alert | Analyst | Operational |
| `GET` | `/api/v1/customers` | Customer risk list with baseline analytics | Analyst | Operational |
| `GET` | `/api/v1/customers/:id` | Customer 360 Risk Dossier with deviations | Analyst | Operational |
| `GET` | `/api/v1/network` | Graph nodes & edges for syndicate visualization | Investigator | Operational |
| `GET` | `/api/v1/network/money-trail/:id` | 4-Stage Forensic Pipeline (Origin → Layering → Cashout → Exfil) | Investigator | Operational |
| `POST` | `/api/v1/simulation/:scenario` | 1-Click Simulation (`ato`, `mule`, `velocity`, `sim_swap`, `normal`) | Judge / Demo | Operational |
| `POST` | `/api/v1/copilot/chat` | Gemini Copilot AI investigation & BFIU SAR staging | Analyst / AI | Operational |
| `GET` | `/api/v1/copilot/briefing` | Executive shift intelligence summary | Analyst / AI | Operational |
| `GET` | `/api/v1/analytics` | Aggregated portfolio fraud metrics & risk distribution | Executive / Analyst | Operational |
| `GET` | `/api/v1/analytics/benchmarks` | Held-out 100-sample benchmark dataset evaluation | Audited | Operational |
| `GET` | `/api/v1/audit` | Append-only immutable system audit logs | Audit / Admin | Operational |

---

## 🔒 Security & Governance

1. **Strict Human-in-the-Loop Governance**: The AI Copilot and automated risk engine recommend holds and biometric step-ups; no autonomous funds blocking occurs without analyst oversight and audit trail.
2. **Immutable Audit Trail**: All state mutations (`ANALYST_HOLD`, `ANALYST_RELEASE`, `EVALUATE_TRANSACTION`, `SIMULATION_RUN`) are logged to an append-only audit stream with correlation request IDs.
3. **Resilient Data Architecture**: Built on `@supabase/supabase-js` PostgREST API with seamless in-memory fallback stores to guarantee zero downtime during network or migration transitions.
