import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type CapsuleRow = Tables<"capsules">;
export type EvidenceRow = Tables<"evidence_packets">;
export type ActivityRow = Tables<"activity">;
export type GateRow = Tables<"gates">;

type OCFContextType = {
  capsules: CapsuleRow[];
  activity: ActivityRow[];
  evidence: EvidenceRow[];
  gates: GateRow[];
  loading: boolean;
  addCapsule: (capsule: Omit<CapsuleRow, "id" | "created_at" | "updated_at">) => Promise<CapsuleRow | null>;
  addActivity: (event: string, capsuleName: string, eventType: string) => Promise<void>;
  addEvidence: (packet: { capsule_name: string; capsule_id?: string; hash: string; checks: number; passed: number; status: string }) => Promise<EvidenceRow | null>;
  addGate: (gate: { pr: string; repo: string; capsule_names: string[]; result: string; findings: string }) => Promise<void>;
  runComplianceCheck: (capsuleId: string) => Promise<EvidenceRow | null>;
  deleteCapsule: (capsuleId: string) => Promise<void>;
  extractObligations: (clause: string) => Promise<{ obligations: any[]; controlMappings: any[]; capsuleName: string } | null>;
  refresh: () => Promise<void>;
};

const OCFContext = createContext<OCFContextType | null>(null);

function generateHash(): string {
  const chars = "0123456789abcdef";
  const start = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * 16)]).join("");
  const end = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * 16)]).join("");
  return `sha256:${start}…${end}`;
}

export const OCFProvider = ({ children }: { children: ReactNode }) => {
  const [capsules, setCapsules] = useState<CapsuleRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [evidence, setEvidence] = useState<EvidenceRow[]>([]);
  const [gates, setGates] = useState<GateRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [capRes, actRes, evdRes, gateRes] = await Promise.all([
      supabase.from("capsules").select("*").order("created_at", { ascending: false }),
      supabase.from("activity").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("evidence_packets").select("*").order("created_at", { ascending: false }),
      supabase.from("gates").select("*").order("created_at", { ascending: false }),
    ]);
    if (capRes.data) setCapsules(capRes.data);
    if (actRes.data) setActivity(actRes.data);
    if (evdRes.data) setEvidence(evdRes.data);
    if (gateRes.data) setGates(gateRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addActivity = useCallback(async (event: string, capsuleName: string, eventType: string) => {
    const { data } = await supabase.from("activity").insert({ event, capsule_name: capsuleName, event_type: eventType }).select().single();
    if (data) setActivity((prev) => [data, ...prev]);
  }, []);

  const addCapsule = useCallback(async (capsule: Omit<CapsuleRow, "id" | "created_at" | "updated_at">) => {
    const { data } = await supabase.from("capsules").insert(capsule).select().single();
    if (data) {
      setCapsules((prev) => [data, ...prev]);
      await addActivity(`Capsule ${capsule.version} signed & published`, capsule.name, "info");
      return data;
    }
    return null;
  }, [addActivity]);

  const addEvidence = useCallback(async (packet: { capsule_name: string; capsule_id?: string; hash: string; checks: number; passed: number; status: string }) => {
    const { data } = await supabase.from("evidence_packets").insert(packet).select().single();
    if (data) setEvidence((prev) => [data, ...prev]);
    return data || null;
  }, []);

  const addGate = useCallback(async (gate: { pr: string; repo: string; capsule_names: string[]; result: string; findings: string }) => {
    const { data } = await supabase.from("gates").insert(gate).select().single();
    if (data) setGates((prev) => [data, ...prev]);
  }, []);

  const deleteCapsule = useCallback(async (capsuleId: string) => {
    const cap = capsules.find((c) => c.id === capsuleId);
    await supabase.from("capsules").delete().eq("id", capsuleId);
    setCapsules((prev) => prev.filter((c) => c.id !== capsuleId));
    if (cap) await addActivity("Capsule removed from registry", cap.name, "warning");
  }, [capsules, addActivity]);

  const runComplianceCheck = useCallback(async (capsuleId: string): Promise<EvidenceRow | null> => {
    const cap = capsules.find((c) => c.id === capsuleId);
    if (!cap) return null;
    const totalChecks = Math.floor(Math.random() * 10) + 5;
    const passed = Math.floor(Math.random() * (totalChecks + 1));
    const status = passed === totalChecks ? "compliant" : passed / totalChecks > 0.8 ? "warning" : "non-compliant";

    const packet = await addEvidence({
      capsule_name: cap.name,
      capsule_id: cap.id,
      hash: generateHash(),
      checks: totalChecks,
      passed,
      status,
    });

    await addActivity(
      status === "compliant" ? "Capsule check passed" : status === "warning" ? `Warning: ${totalChecks - passed} check(s) need attention` : "Non-compliance detected",
      cap.name,
      status === "compliant" ? "success" : status === "warning" ? "warning" : "error"
    );

    // Update capsule status
    await supabase.from("capsules").update({ status, last_run: "just now" }).eq("id", capsuleId);
    setCapsules((prev) => prev.map((c) => c.id === capsuleId ? { ...c, status, last_run: "just now" } : c));

    return packet;
  }, [capsules, addEvidence, addActivity]);

  const extractObligations = useCallback(async (clause: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("extract-obligations", {
        body: { clause },
      });
      if (error) throw error;
      return data as { obligations: any[]; controlMappings: any[]; capsuleName: string };
    } catch (e) {
      console.error("AI extraction failed:", e);
      return null;
    }
  }, []);

  return (
    <OCFContext.Provider value={{ capsules, activity, evidence, gates, loading, addCapsule, addActivity, addEvidence, addGate, runComplianceCheck, deleteCapsule, extractObligations, refresh: fetchAll }}>
      {children}
    </OCFContext.Provider>
  );
};

export const useOCF = () => {
  const ctx = useContext(OCFContext);
  if (!ctx) throw new Error("useOCF must be used within OCFProvider");
  return ctx;
};
