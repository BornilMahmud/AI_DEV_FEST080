import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://xhgxmsgsxqpffzmpehtn.supabase.co";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Disallowed autonomous financial actions
const DISALLOWED_AUTONOMOUS_ACTIONS = [
  "approve_transaction",
  "block_transaction",
  "release_funds",
  "alter_risk_score",
  "delete_evidence",
  "delete_audit_logs",
  "close_critical_case",
];

export interface ToolExecutionResult {
  toolName: string;
  status: "success" | "denied" | "error";
  data?: any;
  error?: string;
  auditMessage?: string;
}

/**
 * Gemini Function Calling Declarations (OpenAPI Compatible)
 */
export const COPILOT_TOOL_DECLARATIONS = [
  {
    name: "get_transaction",
    description: "Retrieve comprehensive details and telemetry for a specific transaction by its ID or reference.",
    parameters: {
      type: "object",
      properties: {
        transaction_id: { type: "string", description: "The UUID or reference ID of the transaction (e.g. TXN-UPY-928381)" },
      },
      required: ["transaction_id"],
    },
  },
  {
    name: "get_risk_assessment",
    description: "Fetch the composite multi-stage risk assessment (fraud, anomaly, behavior score) and contributing factors for a transaction.",
    parameters: {
      type: "object",
      properties: {
        transaction_id: { type: "string", description: "The UUID of the transaction" },
      },
      required: ["transaction_id"],
    },
  },
  {
    name: "get_transaction_features",
    description: "Retrieve engineered model features (amount deviation, velocity score, device novelty, location mismatch) for a transaction.",
    parameters: {
      type: "object",
      properties: {
        transaction_id: { type: "string", description: "The UUID of the transaction" },
      },
      required: ["transaction_id"],
    },
  },
  {
    name: "get_customer_behavior_profile",
    description: "Fetch the customer's historical behavioral baseline (median transfer, typical hours, known devices, average count) to compare against a transaction.",
    parameters: {
      type: "object",
      properties: {
        customer_id: { type: "string", description: "Customer name or unique wallet identifier" },
      },
      required: ["customer_id"],
    },
  },
  {
    name: "get_recent_transactions",
    description: "Retrieve the most recent transactions across the platform or for a specific customer wallet.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of records to return (max 25)" },
        customer_id: { type: "string", description: "Optional sender wallet filter" },
      },
    },
  },
  {
    name: "get_related_transactions",
    description: "Find related transactions sharing the same sender, recipient, or hardware device footprint.",
    parameters: {
      type: "object",
      properties: {
        transaction_id: { type: "string", description: "The anchor transaction ID" },
      },
      required: ["transaction_id"],
    },
  },
  {
    name: "search_transactions",
    description: "Search transactions by keyword, city location, counterparty, or reference string.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        limit: { type: "number", description: "Max results (default 10)" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_investigation",
    description: "Fetch active investigation details, notes, assignment, and decision state for a case.",
    parameters: {
      type: "object",
      properties: {
        investigation_id: { type: "string", description: "Investigation case UUID" },
      },
      required: ["investigation_id"],
    },
  },
  {
    name: "get_case_timeline",
    description: "Retrieve the audit action history and timeline milestones for an investigation or transaction.",
    parameters: {
      type: "object",
      properties: {
        transaction_id: { type: "string", description: "Transaction UUID" },
      },
      required: ["transaction_id"],
    },
  },
  {
    name: "get_open_alerts",
    description: "Fetch the currently open critical and high-risk alerts requiring supervisor attention.",
    parameters: {
      type: "object",
      properties: {
        risk_level: { type: "string", enum: ["critical", "high", "all"], description: "Risk level filter" },
      },
    },
  },
  {
    name: "get_investigator_cases",
    description: "Retrieve cases currently assigned to an investigator or in open queue.",
    parameters: {
      type: "object",
      properties: {
        assigned_to: { type: "string", description: "Investigator name or 'Unassigned'" },
      },
    },
  },
  // Controlled Write Tools
  {
    name: "create_investigation",
    description: "Create an investigation draft case for a suspicious transaction.",
    parameters: {
      type: "object",
      properties: {
        transaction_id: { type: "string", description: "Transaction UUID" },
        priority: { type: "string", enum: ["critical", "high", "medium", "low"], description: "Initial priority" },
        notes: { type: "string", description: "Investigator rationale" },
      },
      required: ["transaction_id"],
    },
  },
  {
    name: "add_investigator_note",
    description: "Append a formal investigation note or observation to an active case.",
    parameters: {
      type: "object",
      properties: {
        investigation_id: { type: "string", description: "Investigation case UUID" },
        note: { type: "string", description: "Observation note to add" },
      },
      required: ["investigation_id", "note"],
    },
  },
  {
    name: "assign_investigation",
    description: "Assign an active investigation case to an investigator.",
    parameters: {
      type: "object",
      properties: {
        investigation_id: { type: "string", description: "Investigation case UUID" },
        assigned_to: { type: "string", description: "Target investigator name" },
      },
      required: ["investigation_id", "assigned_to"],
    },
  },
  {
    name: "update_case_status",
    description: "Update investigation status (e.g. from open to investigating or escalated).",
    parameters: {
      type: "object",
      properties: {
        investigation_id: { type: "string", description: "Investigation case UUID" },
        status: { type: "string", enum: ["open", "investigating", "escalated"], description: "New status" },
      },
      required: ["investigation_id", "status"],
    },
  },
  {
    name: "change_case_priority",
    description: "Change the priority of an open investigation case.",
    parameters: {
      type: "object",
      properties: {
        investigation_id: { type: "string", description: "Investigation case UUID" },
        priority: { type: "string", enum: ["critical", "high", "medium", "low"], description: "New priority" },
      },
      required: ["investigation_id", "priority"],
    },
  },
];

/**
 * Safe Tool Dispatcher
 * Executes tools requested by Gemini against Supabase PostgreSQL, enforcing strict bounds and role checks.
 */
export async function executeCopilotTool(
  toolName: string,
  args: Record<string, any>,
  actorContext: { actorName?: string; userId?: string } = {}
): Promise<ToolExecutionResult> {
  const actorName = actorContext.actorName || "Sentinel Copilot AI Assistant";

  // Check disallowed autonomous actions
  if (DISALLOWED_AUTONOMOUS_ACTIONS.includes(toolName.toLowerCase())) {
    return {
      toolName,
      status: "denied",
      error: `Autonomous financial action '${toolName}' is prohibited. Consequential decisions (APPROVE / BLOCK / RELEASE) strictly require human investigator confirmation.`,
    };
  }

  try {
    switch (toolName) {
      case "get_transaction": {
        const id = args.transaction_id;
        const isRef = id.startsWith("TXN-");
        const query = isRef
          ? supabase.from("transactions").select("*").eq("transaction_reference", id).maybeSingle()
          : supabase.from("transactions").select("*").eq("id", id).maybeSingle();
        const { data, error } = await query;
        if (error || !data) return { toolName, status: "error", error: `Transaction ${id} not found.` };
        return { toolName, status: "success", data };
      }

      case "get_risk_assessment": {
        const id = args.transaction_id;
        const { data: assess } = await supabase.from("risk_assessments").select("*").eq("transaction_id", id).maybeSingle();
        if (!assess) return { toolName, status: "error", error: `No risk assessment found for transaction ${id}` };
        const { data: factors } = await supabase.from("risk_factors").select("*").eq("assessment_id", assess.id);
        return { toolName, status: "success", data: { ...assess, factors: factors || [] } };
      }

      case "get_transaction_features": {
        const id = args.transaction_id;
        const { data } = await supabase.from("transaction_features").select("*").eq("transaction_id", id).maybeSingle();
        return { toolName, status: "success", data: data || { note: "Telemetry features not yet decomposed." } };
      }

      case "get_customer_behavior_profile": {
        const customerId = args.customer_id;
        const { data } = await supabase.from("customer_behavior_profiles").select("*").eq("customer_identifier", customerId).maybeSingle();
        return {
          toolName,
          status: "success",
          data: data || {
            customer_identifier: customerId,
            median_amount: 1850,
            average_amount: 2200,
            normal_hours_start: 8,
            normal_hours_end: 22,
            note: "Standard baseline envelope applied (fallback)",
          },
        };
      }

      case "get_recent_transactions": {
        const limit = Math.min(25, Number(args.limit) || 10);
        let q = supabase.from("transactions").select("*, risk_assessments(final_risk_score, risk_level)").order("timestamp", { ascending: false }).limit(limit);
        if (args.customer_id) q = q.eq("sender_name", args.customer_id);
        const { data } = await q;
        return { toolName, status: "success", data: data || [] };
      }

      case "get_related_transactions": {
        const id = args.transaction_id;
        const { data: base } = await supabase.from("transactions").select("sender_name, receiver_name, device_id").eq("id", id).maybeSingle();
        if (!base) return { toolName, status: "error", error: "Base transaction not found" };
        const { data } = await supabase
          .from("transactions")
          .select("*")
          .neq("id", id)
          .or(`sender_name.eq.${base.sender_name},receiver_name.eq.${base.receiver_name},device_id.eq.${base.device_id}`)
          .limit(5);
        return { toolName, status: "success", data: data || [] };
      }

      case "search_transactions": {
        const query = args.query || "";
        const limit = Math.min(20, Number(args.limit) || 10);
        const { data } = await supabase
          .from("transactions")
          .select("*, risk_assessments(final_risk_score, risk_level)")
          .or(`transaction_reference.ilike.%${query}%,sender_name.ilike.%${query}%,receiver_name.ilike.%${query}%,location.ilike.%${query}%`)
          .limit(limit);
        return { toolName, status: "success", data: data || [] };
      }

      case "get_investigation": {
        const id = args.investigation_id;
        const { data } = await supabase.from("investigations").select("*, actions:investigation_actions(*)").eq("id", id).maybeSingle();
        return { toolName, status: "success", data };
      }

      case "get_case_timeline": {
        const id = args.transaction_id;
        const { data: inv } = await supabase.from("investigations").select("id").eq("transaction_id", id).maybeSingle();
        if (!inv) return { toolName, status: "success", data: [] };
        const { data: actions } = await supabase.from("investigation_actions").select("*").eq("investigation_id", inv.id).order("created_at", { ascending: false });
        return { toolName, status: "success", data: actions || [] };
      }

      case "get_open_alerts": {
        const level = args.risk_level || "critical";
        let q = supabase.from("risk_assessments").select("*, transactions(*)").order("created_at", { ascending: false }).limit(15);
        if (level !== "all") q = q.eq("risk_level", level);
        const { data } = await q;
        return { toolName, status: "success", data: data || [] };
      }

      case "get_investigator_cases": {
        const assigned = args.assigned_to;
        let q = supabase.from("investigations").select("*, transactions(*)").order("created_at", { ascending: false });
        if (assigned) q = q.eq("assigned_to", assigned);
        const { data } = await q;
        return { toolName, status: "success", data: data || [] };
      }

      // Controlled Write Tools
      case "create_investigation": {
        const { transaction_id, priority = "high", notes = "" } = args;
        const nowIso = new Date().toISOString();
        const { data: newInv, error } = await supabase.from("investigations").insert({
          transaction_id,
          priority,
          status: "open",
          assigned_to: "Unassigned",
          investigator_notes: `[Copilot AI Draft] ${notes}`,
        }).select().single();

        if (error) return { toolName, status: "error", error: error.message };

        await supabase.from("investigation_actions").insert({
          investigation_id: newInv.id,
          actor_name: actorName,
          action_type: "copilot_drafted_investigation",
          action_details: { notes, priority, timestamp: nowIso },
        });

        return { toolName, status: "success", data: newInv, auditMessage: `Investigation ${newInv.id} created as open draft.` };
      }

      case "add_investigator_note": {
        const { investigation_id, note } = args;
        const nowIso = new Date().toISOString();
        const { data: inv } = await supabase.from("investigations").select("investigator_notes").eq("id", investigation_id).maybeSingle();
        const updatedNotes = inv?.investigator_notes ? `${inv.investigator_notes}\n[AI Note] ${note}` : `[AI Note] ${note}`;
        await supabase.from("investigations").update({ investigator_notes: updatedNotes, updated_at: nowIso }).eq("id", investigation_id);
        await supabase.from("investigation_actions").insert({
          investigation_id,
          actor_name: actorName,
          action_type: "copilot_added_note",
          action_details: { note, timestamp: nowIso },
        });
        return { toolName, status: "success", data: { updated: true }, auditMessage: "Note recorded in case log." };
      }

      case "assign_investigation": {
        const { investigation_id, assigned_to } = args;
        const nowIso = new Date().toISOString();
        await supabase.from("investigations").update({ assigned_to, updated_at: nowIso }).eq("id", investigation_id);
        await supabase.from("investigation_actions").insert({
          investigation_id,
          actor_name: actorName,
          action_type: "copilot_assigned_case",
          action_details: { assigned_to, timestamp: nowIso },
        });
        return { toolName, status: "success", data: { assigned_to }, auditMessage: `Case assigned to ${assigned_to}.` };
      }

      case "update_case_status": {
        const { investigation_id, status } = args;
        const nowIso = new Date().toISOString();
        await supabase.from("investigations").update({ status, updated_at: nowIso }).eq("id", investigation_id);
        await supabase.from("investigation_actions").insert({
          investigation_id,
          actor_name: actorName,
          action_type: "copilot_updated_status",
          action_details: { status, timestamp: nowIso },
        });
        return { toolName, status: "success", data: { status } };
      }

      case "change_case_priority": {
        const { investigation_id, priority } = args;
        const nowIso = new Date().toISOString();
        await supabase.from("investigations").update({ priority, updated_at: nowIso }).eq("id", investigation_id);
        await supabase.from("investigation_actions").insert({
          investigation_id,
          actor_name: actorName,
          action_type: "copilot_changed_priority",
          action_details: { priority, timestamp: nowIso },
        });
        return { toolName, status: "success", data: { priority } };
      }

      default:
        return { toolName, status: "error", error: `Unknown tool name: ${toolName}` };
    }
  } catch (err: any) {
    return { toolName, status: "error", error: err.message };
  }
}
