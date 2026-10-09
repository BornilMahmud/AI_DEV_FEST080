"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
  ShieldCheck,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface DatasetRecord {
  id: string;
  name: string;
  version: string;
  source: string;
  transaction_count: number;
  customer_count: number;
  fraud_count: number;
  fraud_ratio: number;
  features_count: number;
  train_split: number;
  val_split: number;
  test_split: number;
  leakage_validated: boolean;
  is_synthetic: boolean;
  created_at: string;
}

export const DatasetManagementView: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetRecord[]>([
    {
      id: "ds-001",
      name: "PaySim Mobile Money Benchmark (Curated)",
      version: "paysim-mfs-v1.0",
      source: "PaySim Mobile Money Simulation (Lopez-Rojas et al.)",
      transaction_count: 50000,
      customer_count: 12450,
      fraud_count: 4120,
      fraud_ratio: 0.0824,
      features_count: 18,
      train_split: 70,
      val_split: 15,
      test_split: 15,
      leakage_validated: true,
      is_synthetic: true,
      created_at: "2026-02-01T10:00:00Z",
    },
    {
      id: "ds-002",
      name: "Bangladesh MFS Behavioral Anomaly Set",
      version: "paysim-mfs-v1.2",
      source: "Synthesized Telemetry & PaySim Fusion with Velocity Profiles",
      transaction_count: 120000,
      customer_count: 28900,
      fraud_count: 9840,
      fraud_ratio: 0.082,
      features_count: 24,
      train_split: 70,
      val_split: 15,
      test_split: 15,
      leakage_validated: true,
      is_synthetic: true,
      created_at: "2026-03-01T15:00:00Z",
    },
    {
      id: "ds-003",
      name: "Initial MFS Prototype Sandbox",
      version: "synthetic-v0.5",
      source: "Rule-Engine Bootstrap Data",
      transaction_count: 25000,
      customer_count: 6000,
      fraud_count: 1850,
      fraud_ratio: 0.074,
      features_count: 12,
      train_split: 80,
      val_split: 10,
      test_split: 10,
      leakage_validated: true,
      is_synthetic: true,
      created_at: "2026-01-15T09:00:00Z",
    },
  ]);

  useEffect(() => {
    async function loadDatasets() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
        const res = await fetch(`${backendUrl}/api/v1/admin/datasets`);
        if (res.ok) {
          const data = await res.json();
          if (data.datasets && data.datasets.length > 0) {
            setDatasets(data.datasets);
          }
        }
      } catch (e) {}
    }
    loadDatasets();
  }, []);

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database size={22} className="text-blue-600" />
            <span>Dataset Registry & Leakage Validation</span>
          </h1>
          <p className="text-xs text-slate-500">
            Training corpus management, temporal splits, and balance-leakage prevention for MFS fraud classifiers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Balance Leakage Guard Active</span>
          </span>
        </div>
      </div>

      {/* Dataset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {datasets.map((ds) => (
          <div
            key={ds.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {ds.version}
              </span>
              {ds.leakage_validated ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 size={11} className="text-emerald-600" />
                  <span>Leakage Verified</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Unverified
                </span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{ds.name}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{ds.source}</p>
            </div>

            {/* Counts & Statistics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block">Total Transactions</span>
                <span className="text-sm font-extrabold text-slate-900">{ds.transaction_count.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold block">Fraud Count & Ratio</span>
                <span className="text-sm font-extrabold text-rose-600">
                  {ds.fraud_count.toLocaleString()} ({(ds.fraud_ratio * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Splits */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[11px] text-slate-600 font-semibold">
                <span>Split Distribution</span>
                <span>{ds.train_split}% Train / {ds.val_split}% Val / {ds.test_split}% Test</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                <div style={{ width: `${ds.train_split}%` }} className="bg-blue-600 h-full" title="Train" />
                <div style={{ width: `${ds.val_split}%` }} className="bg-amber-500 h-full" title="Validation" />
                <div style={{ width: `${ds.test_split}%` }} className="bg-emerald-500 h-full" title="Test" />
              </div>
            </div>

            {/* Privacy & Synthetic Labeling */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400">
              <span>{ds.is_synthetic ? "Synthetic Benchmark Data" : "Production Corpus"}</span>
              <span>{ds.features_count} Engineered Features</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
