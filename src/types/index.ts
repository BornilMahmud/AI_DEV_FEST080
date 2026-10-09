export type RiskLevel = "Critical" | "High" | "Medium" | "Low";

export type NavigationPage =
  | "overview"
  | "transactions"
  | "risk"
  | "network"
  | "investigations"
  | "investigation"
  | "customers"
  | "alerts"
  | "analytics"
  | "customer-portal"
  | "models"
  | "datasets"
  | "system-health"
  | "security"
  | "audit"
  | "profile";

export type TransactionType =
  | "Wallet Transfer"
  | "Cash Out"
  | "Merchant Pay"
  | "Add Money"
  | "Mobile Recharge"
  | "Utility Bill";

export interface Transaction {
  id: string;
  customer: string;
  recipient: string;
  amount: number;
  time: string;
  timestamp: number;
  type: TransactionType;
  device: string;
  isNewDevice: boolean;
  location: string;
  isNewLocation: boolean;
  riskLevel: RiskLevel;
  riskScore: number;
  status: "Approved" | "Monitoring" | "Flagged" | "Investigating" | "Blocked";
  flags: string[];
}

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
  deviated: boolean;
}

export interface InvestigationCase {
  id: string;
  riskLevel: RiskLevel;
  customer: string;
  amount: number;
  reason: string;
  analyst: string;
  status: "Investigating" | "Pending Review" | "Monitoring" | "Resolved" | "Escalated";
  updated: string;
  createdTime: string;
  exposure: number;
  transactionsCount: number;
  networkConnections: number;
  riskScore: number;
  summary: string;
  recommendation: string;
  confidence: number;
}

export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  isCritical?: boolean;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: "customer" | "recipient" | "device" | "merchant" | "agent";
  risk: RiskLevel | "normal";
  x: number;
  y: number;
  clusterId?: number;
  amount?: number;
  details?: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  amount?: number;
  isHot?: boolean;
  type?: "transfer" | "shared_device" | "agent_cashout";
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  riskLevel: RiskLevel;
  riskScore: number;
  kycStatus: "Verified" | "Tier-1" | "Pending";
  accountAge: string;
  totalVolume: number;
  avgTransaction: number;
  knownDevices: string[];
  knownLocations: string[];
  typicalHours: string;
  recentDeviations: {
    title: string;
    value: string;
    severity: RiskLevel;
    timestamp: string;
  }[];
}

export interface AlertItem {
  id: string;
  severity: RiskLevel;
  title: string;
  description: string;
  timeAgo: string;
  iconType: "network" | "shield" | "activity" | "device";
  confidence: number;
  relatedId: string;
  unread: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "analyst" | "ai";
  text: string;
  timestamp: string;
  evidenceUsed?: string[];
  disclaimer?: string;
}
