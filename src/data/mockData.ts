import { CapsuleData } from "@/components/CapsuleCard";

export const capsules: CapsuleData[] = [
  {
    id: "cap-001",
    name: "US Data Residency",
    version: "v1.2.0",
    status: "compliant",
    obligations: 3,
    lastRun: "2 min ago",
    source: "Contract §4.1 — Acme Corp",
  },
  {
    id: "cap-002",
    name: "PII Retention 24mo",
    version: "v1.0.1",
    status: "non-compliant",
    obligations: 2,
    lastRun: "14 min ago",
    source: "GDPR Art. 5(1)(e)",
  },
  {
    id: "cap-003",
    name: "MFA Enforcement",
    version: "v2.0.0",
    status: "compliant",
    obligations: 1,
    lastRun: "5 min ago",
    source: "SOC2 CC6.1",
  },
  {
    id: "cap-004",
    name: "Privileged Access Review",
    version: "v1.1.0",
    status: "warning",
    obligations: 4,
    lastRun: "1 hr ago",
    source: "Internal Policy P-SEC-007",
  },
  {
    id: "cap-005",
    name: "Encryption at Rest",
    version: "v1.0.0",
    status: "compliant",
    obligations: 2,
    lastRun: "30 min ago",
    source: "HIPAA §164.312(a)(2)(iv)",
  },
  {
    id: "cap-006",
    name: "Vendor Data Processing",
    version: "v0.9.0",
    status: "pending",
    obligations: 5,
    lastRun: "never",
    source: "DPA — CloudVendor Inc.",
  },
];

export const recentActivity = [
  { time: "2 min ago", event: "Capsule check passed", capsule: "US Data Residency", type: "success" as const },
  { time: "14 min ago", event: "Non-compliance detected", capsule: "PII Retention 24mo", type: "error" as const },
  { time: "22 min ago", event: "Remediation PR created", capsule: "PII Retention 24mo", type: "info" as const },
  { time: "1 hr ago", event: "Warning: 2 exceptions expiring", capsule: "Privileged Access Review", type: "warning" as const },
  { time: "2 hr ago", event: "Evidence packet generated", capsule: "MFA Enforcement", type: "success" as const },
  { time: "3 hr ago", event: "Capsule v2.0.0 signed & published", capsule: "MFA Enforcement", type: "info" as const },
];

export const obligations = [
  { id: "obl-1", text: "Customer PII must remain in US regions", scope: "Azure Resources", enforcement: "Block", framework: "Contract" },
  { id: "obl-2", text: "Data retained no longer than 24 months", scope: "Purview", enforcement: "Auto-delete", framework: "GDPR" },
  { id: "obl-3", text: "Access must require MFA", scope: "Entra ID", enforcement: "Conditional Access", framework: "SOC2" },
  { id: "obl-4", text: "Exceptions must be logged and approved", scope: "Azure DevOps", enforcement: "Audit", framework: "Internal" },
];

export const controlMappings = [
  { obligation: "US region constraint", control: "Azure Policy — allowedLocations", type: "Azure Policy", confidence: 0.96 },
  { obligation: "24-month retention", control: "Purview Retention Label — 24mo-auto-delete", type: "Purview", confidence: 0.91 },
  { obligation: "MFA requirement", control: "Conditional Access — require-mfa-all-users", type: "Entra ID", confidence: 0.98 },
  { obligation: "Exception logging", control: "Azure Monitor — exception-audit-rule", type: "Monitor", confidence: 0.87 },
];
