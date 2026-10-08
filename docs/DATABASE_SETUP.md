# Supabase Database Schema Setup Guide

Follow this guide to initialize all 12 database tables, indexes, constraints, and Row Level Security (RLS) policies in your Supabase project.

---

## ⚡ Quick 1-Click Execution via Supabase Dashboard

1. **Log in to Supabase**:
   Navigate to [https://supabase.com/dashboard/project/xhgxmsgsxqpffzmpehtn](https://supabase.com/dashboard/project/xhgxmsgsxqpffzmpehtn).

2. **Open SQL Editor**:
   Click on the **SQL Editor** icon (represented by the `>_` terminal icon) on the left sidebar.

3. **Paste Migration Script**:
   - Open [`backend/supabase/unified_schema.sql`](../backend/supabase/unified_schema.sql) in this repository.
   - Copy the entire SQL content.
   - Paste it into the Supabase SQL Editor query window.

4. **Click "Run"**:
   Click the green **Run** button at the bottom right of the query window.

5. **Verify Created Tables**:
   Under **Table Editor** on the left sidebar, verify that all 12 tables appear:
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

---

## 🛡️ Built-in Resilience Guarantee

While tables are being initialized in Supabase, the **upay Sentinel** backend operates with a resilient in-memory fallback store:
- Transaction ingestion (`POST /api/v1/transactions`)
- Analyst decision execution (`POST /api/v1/transactions/:id/decision`)
- Alert acknowledgment and resolution
- Immutable audit log query
All function seamlessly with **zero downtime** and **zero 500 errors**. Once you run the SQL script in your Supabase SQL editor, the tables will immediately begin syncing live data via PostgREST.
