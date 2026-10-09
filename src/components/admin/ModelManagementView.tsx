"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  GitBranch,
  BarChart3,
  Calendar,
  Lock,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

interface ModelRecord {
  id: string;
  name: string;
  version: string;
  model_type: string;
  feature_version: string;
  dataset_version: string;
  status: "ACTIVE" | "STAGED" | "RETIRED";
  precision: number;
  recall: number;
  f1_score: number;
  pr_auc: number;
  roc_auc: number;
  training_samples: number;
  fraud_samples: number;
  created_at: string;
}

interface ModelManagementViewProps {
  onNotify?: (msg: string) => void;
}

export const ModelManagementView: React.FC<ModelManagementViewProps> = ({ onNotify }) => {
  const [models, setModels] = useState<ModelRecord[]>([
    {
      id: "mdl-001",
      name: "PaySim Gradient Boosting Classifier",
      version: "v1.2.0",
      model_type: "HistGradientBoostingClassifier",
      feature_version: "features-v1.2",
      dataset_version: "paysim-mfs-v1.0",
      status: "ACTIVE",
      precision: 0.942,
      recall: 0.915,
      f1_score: 0.928,
      pr_auc: 0.934,
      roc_auc: 0.988,
      training_samples: 50000,
      fraud_samples: 4120,
      created_at: "2026-03-01T10:00:00Z",
    },
    {
      id: "mdl-002",
      name: "PyTorch Sentinel Deep MLP",
      version: "v2.0.0-rc1",
      model_type: "PyTorch SentinelMLP",
      feature_version: "features-v2.0-embeddings",
      dataset_version: "paysim-mfs-v1.2",
      status: "STAGED",
      precision: 0.961,
      recall: 0.938,
      f1_score: 0.949,
      pr_auc: 0.952,
      roc_auc: 0.993,
      training_samples: 120000,
      fraud_samples: 9840,
      created_at: "2026-03-05T14:30:00Z",
    },
    {
      id: "mdl-003",
      name: "Isolation Forest Anomaly Detector",
      version: "v1.0.4",
      model_type: "IsolationForest",
      feature_version: "features-v1.0",
      dataset_version: "paysim-mfs-v1.0",
      status: "ACTIVE",
      precision: 0.884,
      recall: 0.897,
      f1_score: 0.89,
      pr_auc: 0.892,
      roc_auc: 0.951,
      training_samples: 50000,
      fraud_samples: 4120,
      created_at: "2026-02-15T08:00:00Z",
    },
    {
      id: "mdl-004",
      name: "Baseline Random Forest",
      version: "v0.9.1",
      model_type: "RandomForestClassifier",
      feature_version: "features-v0.9",
      dataset_version: "synthetic-v0.5",
      status: "RETIRED",
      precision: 0.825,
      recall: 0.791,
      f1_score: 0.807,
      pr_auc: 0.812,
      roc_auc: 0.914,
      training_samples: 25000,
      fraud_samples: 1850,
      created_at: "2026-01-20T12:00:00Z",
    },
  ]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<ModelRecord | null>(null);
  const [deployingId, setDeployingId] = useState<string | null>(null);

  // Fetch real model registry from backend if available
  useEffect(() => {
    async function loadModels() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
        const res = await fetch(`${backendUrl}/api/v1/admin/models`);
        if (res.ok) {
          const data = await res.json();
          if (data.models && data.models.length > 0) {
            setModels(data.models);
          }
        }
      } catch (e) {
        // Fallback to initial seed models
      }
    }
    loadModels();
  }, []);

  const handleDeployModel = async (model: ModelRecord) => {
    if (!window.confirm(`Deploy ${model.name} (${model.version}) as the ACTIVE production model? This will transition other models of the same type to RETIRED.`)) {
      return;
    }

    setDeployingId(model.id);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const res = await fetch(`${backendUrl}/api/v1/admin/models/${model.id}/deploy`, {
        method: "POST",
      });

      if (res.ok) {
        setModels((prev) =>
          prev.map((m) => {
            if (m.id === model.id) return { ...m, status: "ACTIVE" };
            if (m.model_type === model.model_type && m.status === "ACTIVE") return { ...m, status: "RETIRED" };
            return m;
          })
        );
        if (onNotify) onNotify(`Successfully deployed ${model.version} to active production.`);
      }
    } catch (err: any) {
      if (onNotify) onNotify(`Model deployment note: ${err.message}`);
    } finally {
      setDeployingId(null);
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu size={22} className="text-blue-600" />
            <span>ML Model Governance & Registry</span>
          </h1>
          <p className="text-xs text-slate-500">
            Versioned Scikit-Learn, Isolation Forest, and PyTorch Neural Architectures for MFS Risk Scoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Deployment Governance Enforced</span>
          </span>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => (
          <SpotlightCard
            key={model.id}
            color="purple"
            glowSize="medium"
            lightsEdges={true}
            lag="short"
            className={`p-5 rounded-2xl bg-white border transition-all shadow-subtle flex flex-col justify-between ${
              model.status === "ACTIVE"
                ? "border-blue-400 ring-1 ring-blue-500/10"
                : model.status === "STAGED"
                ? "border-amber-300"
                : "border-slate-200 opacity-80"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    model.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : model.status === "STAGED"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {model.status}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">{model.version}</span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{model.name}</h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{model.model_type}</p>

              {/* Performance Metrics Table */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-[10px] text-slate-400 font-semibold block">Precision</span>
                  <span className="text-xs font-extrabold text-slate-900">{(model.precision * 100).toFixed(1)}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-[10px] text-slate-400 font-semibold block">Recall</span>
                  <span className="text-xs font-extrabold text-slate-900">{(model.recall * 100).toFixed(1)}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-[10px] text-slate-400 font-semibold block">F1 Score</span>
                  <span className="text-xs font-extrabold text-blue-600">{(model.f1_score * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 text-center text-xs">
                <div className="p-1.5 rounded-lg bg-slate-50 text-[11px]">
                  <span className="text-slate-400 text-[10px]">PR-AUC: </span>
                  <strong className="text-slate-800 font-bold">{model.pr_auc.toFixed(3)}</strong>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 text-[11px]">
                  <span className="text-slate-400 text-[10px]">ROC-AUC: </span>
                  <strong className="text-slate-800 font-bold">{model.roc_auc.toFixed(3)}</strong>
                </div>
              </div>

              {/* Lineage Metadata */}
              <div className="mt-3 space-y-1 text-[10.5px] text-slate-500">
                <div className="flex justify-between">
                  <span>Feature Pipeline:</span>
                  <span className="font-mono text-slate-700">{model.feature_version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Training Dataset:</span>
                  <span className="font-mono text-slate-700">{model.dataset_version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Training Samples:</span>
                  <span className="text-slate-700 font-semibold">
                    {model.training_samples.toLocaleString()} ({model.fraud_samples.toLocaleString()} fraud)
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Trained: {new Date(model.created_at).toLocaleDateString()}
              </span>

              {model.status === "STAGED" && (
                <button
                  onClick={() => handleDeployModel(model)}
                  disabled={deployingId === model.id}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                >
                  {deployingId === model.id ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <ArrowUpRight size={13} />
                  )}
                  <span>Promote to Active</span>
                </button>
              )}

              {model.status === "ACTIVE" && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Production Active</span>
                </span>
              )}
            </div>
          </SpotlightCard>
        ))}
      </div>
    </div>
  );
};
