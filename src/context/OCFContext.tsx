import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { CapsuleData } from "@/components/CapsuleCard";
import { capsules as initialCapsules, recentActivity as initialActivity } from "@/data/mockData";

export type ActivityItem = {
  time: string;
  event: string;
  capsule: string;
  type: "success" | "error" | "warning" | "info";
};

export type EvidencePacket = {
  id: string;
  capsule: string;
  timestamp: string;
  hash: string;
  checks: number;
  passed: number;
  status: "compliant" | "non-compliant" | "warning";
};

export type GateResult = {
  id: string;
  pr: string;
  repo: string;
  capsules: string[];
  result: "blocked" | "passed" | "warning" | "pending";
  findings: string;
  time: string;
};

type OCFContextType = {
  capsules: CapsuleData[];
  activity: ActivityItem[];
  evidence: EvidencePacket[];
  gates: GateResult[];
  addCapsule: (capsule: CapsuleData) => void;
  addActivity: (item: ActivityItem) => void;
  addEvidence: (packet: EvidencePacket) => void;
  addGate: (gate: GateResult) => void;
  runComplianceCheck: (capsuleId: string) => EvidencePacket;
  deleteCapsule: (capsuleId: string) => void;
};

const OCFContext = createContext<OCFContextType | null>(null);

const initialEvidence: EvidencePacket[] = [
  { id: "evd-001", capsule: "US Data Residency", timestamp: "2026-02-27T14:22:00Z", hash: "sha256:a3f8…c21d", checks: 12, passed: 12, status: "compliant" },
  { id: "evd-002", capsule: "PII Retention 24mo", timestamp: "2026-02-27T14:08:00Z", hash: "sha256:b7d2…e44f", checks: 8, passed: 6, status: "non-compliant" },
  { id: "evd-003", capsule: "MFA Enforcement", timestamp: "2026-02-27T14:17:00Z", hash: "sha256:c1e9…f88a", checks: 5, passed: 5, status: "compliant" },
  { id: "evd-004", capsule: "Privileged Access Review", timestamp: "2026-02-27T13:22:00Z", hash: "sha256:d4a1…b33c", checks: 15, passed: 13, status: "warning" },
];

const initialGates: GateResult[] = [
  { id: "gate-1", pr: "PR #247 — Add EU storage account", repo: "infra/azure-resources", capsules: ["US Data Residency"], result: "blocked", findings: "Resource location 'westeurope' violates US-only constraint", time: "3 min ago" },
  { id: "gate-2", pr: "PR #245 — Update retention policy", repo: "compliance/purview-config", capsules: ["PII Retention 24mo"], result: "passed", findings: "All retention labels within 24-month limit", time: "1 hr ago" },
  { id: "gate-3", pr: "PR #243 — Service principal update", repo: "identity/entra-config", capsules: ["MFA Enforcement", "Privileged Access Review"], result: "warning", findings: "MFA passed. 1 privileged role missing access review schedule", time: "2 hr ago" },
  { id: "gate-4", pr: "PR #240 — New vendor integration", repo: "apps/vendor-portal", capsules: ["Vendor Data Processing"], result: "pending", findings: "Capsule awaiting first compliance check run", time: "4 hr ago" },
];

function generateHash(): string {
  const chars = "0123456789abcdef";
  const start = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * 16)]).join("");
  const end = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * 16)]).join("");
  return `sha256:${start}…${end}`;
}

export const OCFProvider = ({ children }: { children: ReactNode }) => {
  const [capsules, setCapsules] = useState<CapsuleData[]>(initialCapsules);
  const [activity, setActivity] = useState<ActivityItem[]>(initialActivity);
  const [evidence, setEvidence] = useState<EvidencePacket[]>(initialEvidence);
  const [gates, setGates] = useState<GateResult[]>(initialGates);

  const addActivity = useCallback((item: ActivityItem) => {
    setActivity((prev) => [item, ...prev]);
  }, []);

  const addCapsule = useCallback((capsule: CapsuleData) => {
    setCapsules((prev) => [capsule, ...prev]);
    addActivity({ time: "just now", event: `Capsule ${capsule.version} signed & published`, capsule: capsule.name, type: "info" });
  }, [addActivity]);

  const addEvidence = useCallback((packet: EvidencePacket) => {
    setEvidence((prev) => [packet, ...prev]);
  }, []);

  const addGate = useCallback((gate: GateResult) => {
    setGates((prev) => [gate, ...prev]);
  }, []);

  const deleteCapsule = useCallback((capsuleId: string) => {
    setCapsules((prev) => {
      const cap = prev.find((c) => c.id === capsuleId);
      if (cap) {
        addActivity({ time: "just now", event: `Capsule removed from registry`, capsule: cap.name, type: "warning" });
      }
      return prev.filter((c) => c.id !== capsuleId);
    });
  }, [addActivity]);

  const runComplianceCheck = useCallback((capsuleId: string): EvidencePacket => {
    const cap = capsules.find((c) => c.id === capsuleId);
    const name = cap?.name || "Unknown";
    const totalChecks = Math.floor(Math.random() * 10) + 5;
    const passed = Math.floor(Math.random() * (totalChecks + 1));
    const status: EvidencePacket["status"] = passed === totalChecks ? "compliant" : passed / totalChecks > 0.8 ? "warning" : "non-compliant";
    
    const packet: EvidencePacket = {
      id: `evd-${Date.now()}`,
      capsule: name,
      timestamp: new Date().toISOString(),
      hash: generateHash(),
      checks: totalChecks,
      passed,
      status,
    };

    addEvidence(packet);
    addActivity({
      time: "just now",
      event: status === "compliant" ? "Capsule check passed" : status === "warning" ? `Warning: ${totalChecks - passed} check(s) need attention` : "Non-compliance detected",
      capsule: name,
      type: status === "compliant" ? "success" : status === "warning" ? "warning" : "error",
    });

    // Update capsule status
    setCapsules((prev) => prev.map((c) => c.id === capsuleId ? { ...c, status, lastRun: "just now" } : c));

    return packet;
  }, [capsules, addEvidence, addActivity]);

  return (
    <OCFContext.Provider value={{ capsules, activity, evidence, gates, addCapsule, addActivity, addEvidence, addGate, runComplianceCheck, deleteCapsule }}>
      {children}
    </OCFContext.Provider>
  );
};

export const useOCF = () => {
  const ctx = useContext(OCFContext);
  if (!ctx) throw new Error("useOCF must be used within OCFProvider");
  return ctx;
};
