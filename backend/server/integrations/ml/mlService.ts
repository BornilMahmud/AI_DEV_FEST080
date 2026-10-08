/**
 * Python ML Inference Service Integration for upay Sentinel
 * Connects Express Backend (port 3001) with FastAPI Python ML Service (port 8000)
 */

export interface PythonMlPrediction {
  ml_available: boolean;
  model_version: string;
  feature_version: string;
  fraud_probability: number;
  anomaly_score: number;
  neural_score?: number | null;
  ensemble_score: number;
  prediction: "LEGITIMATE" | "SUSPICIOUS" | "CRITICAL";
  top_risk_factors: Array<{
    feature: string;
    value: number;
    impact: number;
    description: string;
  }>;
  fallback_used: boolean;
  fallback_reason?: string;
}

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const ML_TIMEOUT_MS = 1500;

export async function invokePythonMlService(rawTransaction: any): Promise<PythonMlPrediction> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

    const res = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transaction_id: rawTransaction.id || rawTransaction.transaction_reference,
        raw_transaction: rawTransaction,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Python ML Service responded with HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      ml_available: true,
      model_version: data.model_version || "sentinel-ml-v1.0.0",
      feature_version: data.feature_version || "features-v1",
      fraud_probability: data.fraud_probability,
      anomaly_score: data.anomaly_score,
      neural_score: data.neural_score,
      ensemble_score: data.ensemble_score,
      prediction: data.prediction,
      top_risk_factors: data.top_risk_factors || [],
      fallback_used: false,
    };
  } catch (err: any) {
    // Graceful, resilient fallback when Python service is offline or times out
    const amount = Number(rawTransaction.amount || 0);
    const isNewDevice = Boolean(rawTransaction.isNewDevice || rawTransaction.device_new);
    const isMule = rawTransaction.recipient === "U-8831" || rawTransaction.receiver_name === "U-8831";
    
    let approxScore = 0.15;
    if (amount > 40000) approxScore += 0.35;
    if (isNewDevice) approxScore += 0.25;
    if (isMule) approxScore += 0.35;
    approxScore = Math.min(0.98, Math.max(0.08, approxScore));

    return {
      ml_available: false,
      model_version: "sentinel-ml-fallback-v1",
      feature_version: "features-v1",
      fraud_probability: approxScore,
      anomaly_score: isNewDevice ? 0.75 : 0.20,
      neural_score: null,
      ensemble_score: approxScore,
      prediction: approxScore >= 0.75 ? "CRITICAL" : approxScore >= 0.50 ? "SUSPICIOUS" : "LEGITIMATE",
      top_risk_factors: [
        ...(isMule ? [{ feature: "mule_cluster_link", value: 1, impact: 0.35, description: "Recipient linked to Mule Cluster #17 (Fallback)" }] : []),
        ...(amount > 40000 ? [{ feature: "amount_elevation", value: amount, impact: 0.30, description: `Amount ৳${amount.toLocaleString()} elevated (Fallback)` }] : []),
      ],
      fallback_used: true,
      fallback_reason: err.name === "AbortError" ? "TIMEOUT_EXCEEDED" : (err.message || "SERVICE_UNAVAILABLE"),
    };
  }
}
