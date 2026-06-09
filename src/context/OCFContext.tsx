import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

export type CapsuleRow = {
  id: string;
  name: string;
  version?: string | null;
  status?: string | null;
  last_run?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any;
};

export type EvidenceRow = {
  id: string;
  capsule_name: string;
  capsule_id?: string | null;
  hash: string;
  checks: number;
  passed: number;
  status: string;
  created_at: string;
  [key: string]: any;
};

export type ActivityRow = {
  id: string;
  event: string;
  capsule_name: string;
  event_type: string;
  created_at: string;
  [key: string]: any;
};

export type GateRow = {
  id: string;
  pr: string;
  repo: string;
  capsule_names: string[];
  result: string;
  findings: string;
  created_at: string;
  [key: string]: any;
};

type OCFContextType = {
  capsules: CapsuleRow[];
  activity: ActivityRow[];
  evidence: EvidenceRow[];
  gates: GateRow[];
  loading: boolean;
  addCapsule: (
    capsule: Omit<CapsuleRow, "id" | "created_at" | "updated_at">
  ) => Promise<CapsuleRow | null>;
  addActivity: (
    event: string,
    capsuleName: string,
    eventType: string
  ) => Promise<void>;
  addEvidence: (packet: {
    capsule_name: string;
    capsule_id?: string;
    hash: string;
    checks: number;
    passed: number;
    status: string;
  }) => Promise<EvidenceRow | null>;
  addGate: (gate: {
    pr: string;
    repo: string;
    capsule_names: string[];
    result: string;
    findings: string;
  }) => Promise<void>;
  runComplianceCheck: (capsuleId: string) => Promise<EvidenceRow | null>;
  deleteCapsule: (capsuleId: string) => Promise<void>;
  extractObligations: (
    clause: string
  ) => Promise<{
    obligations: any[];
    controlMappings: any[];
    capsuleName: string;
  } | null>;
  refresh: () => Promise<void>;
};

const OCFContext = createContext<OCFContextType | null>(null);

const STORAGE_KEYS = {
  capsules: "ocf_capsules",
  activity: "ocf_activity",
  evidence: "ocf_evidence",
  gates: "ocf_gates",
};

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function now(): string {
  return new Date().toISOString();
}

function generateHash(): string {
  const chars = "0123456789abcdef";
  const start = Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * 16)]
  ).join("");
  const end = Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * 16)]
  ).join("");

  return `sha256:${start}…${end}`;
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write errors.
  }
}

export const OCFProvider = ({ children }: { children: ReactNode }) => {
  const [capsules, setCapsules] = useState<CapsuleRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [evidence, setEvidence] = useState<EvidenceRow[]>([]);
  const [gates, setGates] = useState<GateRow[]>([]);
  const [loading, setLoading] = useState(true);

  const persistAll = useCallback(
    (next?: {
      capsules?: CapsuleRow[];
      activity?: ActivityRow[];
      evidence?: EvidenceRow[];
      gates?: GateRow[];
    }) => {
      writeStorage(STORAGE_KEYS.capsules, next?.capsules ?? capsules);
      writeStorage(STORAGE_KEYS.activity, next?.activity ?? activity);
      writeStorage(STORAGE_KEYS.evidence, next?.evidence ?? evidence);
      writeStorage(STORAGE_KEYS.gates, next?.gates ?? gates);
    },
    [capsules, activity, evidence, gates]
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);

    const storedCapsules = readStorage<CapsuleRow[]>(
      STORAGE_KEYS.capsules,
      []
    );
    const storedActivity = readStorage<ActivityRow[]>(
      STORAGE_KEYS.activity,
      []
    );
    const storedEvidence = readStorage<EvidenceRow[]>(
      STORAGE_KEYS.evidence,
      []
    );
    const storedGates = readStorage<GateRow[]>(STORAGE_KEYS.gates, []);

    setCapsules(storedCapsules);
    setActivity(storedActivity);
    setEvidence(storedEvidence);
    setGates(storedGates);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addActivity = useCallback(
    async (event: string, capsuleName: string, eventType: string) => {
      const row: ActivityRow = {
        id: generateId(),
        event,
        capsule_name: capsuleName,
        event_type: eventType,
        created_at: now(),
      };

      setActivity((prev) => {
        const next = [row, ...prev].slice(0, 50);
        writeStorage(STORAGE_KEYS.activity, next);
        return next;
      });
    },
    []
  );

  const addCapsule = useCallback(
    async (
      capsule: Omit<CapsuleRow, "id" | "created_at" | "updated_at">
    ): Promise<CapsuleRow | null> => {
      const timestamp = now();

      const row: CapsuleRow = {
        ...capsule,
        id: generateId(),
        created_at: timestamp,
        updated_at: timestamp,
        status: capsule.status ?? "draft",
        last_run: capsule.last_run ?? "never",
      };

      setCapsules((prev) => {
        const next = [row, ...prev];
        writeStorage(STORAGE_KEYS.capsules, next);
        return next;
      });

      await addActivity(
        `Capsule ${capsule.version ?? ""} signed & published`.trim(),
        capsule.name,
        "info"
      );

      return row;
    },
    [addActivity]
  );

  const addEvidence = useCallback(
    async (packet: {
      capsule_name: string;
      capsule_id?: string;
      hash: string;
      checks: number;
      passed: number;
      status: string;
    }): Promise<EvidenceRow | null> => {
      const row: EvidenceRow = {
        id: generateId(),
        capsule_name: packet.capsule_name,
        capsule_id: packet.capsule_id ?? null,
        hash: packet.hash,
        checks: packet.checks,
        passed: packet.passed,
        status: packet.status,
        created_at: now(),
      };

      setEvidence((prev) => {
        const next = [row, ...prev];
        writeStorage(STORAGE_KEYS.evidence, next);
        return next;
      });

      return row;
    },
    []
  );

  const addGate = useCallback(
    async (gate: {
      pr: string;
      repo: string;
      capsule_names: string[];
      result: string;
      findings: string;
    }) => {
      const row: GateRow = {
        id: generateId(),
        pr: gate.pr,
        repo: gate.repo,
        capsule_names: gate.capsule_names,
        result: gate.result,
        findings: gate.findings,
        created_at: now(),
      };

      setGates((prev) => {
        const next = [row, ...prev];
        writeStorage(STORAGE_KEYS.gates, next);
        return next;
      });
    },
    []
  );

  const deleteCapsule = useCallback(
    async (capsuleId: string) => {
      const cap = capsules.find((c) => c.id === capsuleId);

      setCapsules((prev) => {
        const next = prev.filter((c) => c.id !== capsuleId);
        writeStorage(STORAGE_KEYS.capsules, next);
        return next;
      });

      if (cap) {
        await addActivity("Capsule removed from registry", cap.name, "warning");
      }
    },
    [capsules, addActivity]
  );

  const runComplianceCheck = useCallback(
    async (capsuleId: string): Promise<EvidenceRow | null> => {
      const cap = capsules.find((c) => c.id === capsuleId);
      if (!cap) return null;

      const totalChecks = Math.floor(Math.random() * 10) + 5;
      const passed = Math.floor(Math.random() * (totalChecks + 1));

      const status =
        passed === totalChecks
          ? "compliant"
          : passed / totalChecks > 0.8
            ? "warning"
            : "non-compliant";

      const packet = await addEvidence({
        capsule_name: cap.name,
        capsule_id: cap.id,
        hash: generateHash(),
        checks: totalChecks,
        passed,
        status,
      });

      await addActivity(
        status === "compliant"
          ? "Capsule check passed"
          : status === "warning"
            ? `Warning: ${totalChecks - passed} check(s) need attention`
            : "Non-compliance detected",
        cap.name,
        status === "compliant"
          ? "success"
          : status === "warning"
            ? "warning"
            : "error"
      );

      setCapsules((prev) => {
        const next = prev.map((c) =>
          c.id === capsuleId
            ? {
                ...c,
                status,
                last_run: "just now",
                updated_at: now(),
              }
            : c
        );

        writeStorage(STORAGE_KEYS.capsules, next);
        return next;
      });

      return packet;
    },
    [capsules, addEvidence, addActivity]
  );

  const extractObligations = useCallback(async (clause: string) => {
    if (!clause.trim()) return null;

    const capsuleName =
      clause
        .split(/[.!?\n]/)[0]
        ?.trim()
        ?.slice(0, 48) || "Generated Obligation Capsule";

    return {
      capsuleName,
      obligations: [
        {
          id: generateId(),
          text: clause.trim(),
          source: "manual_input",
          priority: "medium",
        },
      ],
      controlMappings: [
        {
          id: generateId(),
          control: "manual_review_required",
          description:
            "AI extraction is not connected yet. This obligation requires manual review.",
        },
      ],
    };
  }, []);

  return (
    <OCFContext.Provider
      value={{
        capsules,
        activity,
        evidence,
        gates,
        loading,
        addCapsule,
        addActivity,
        addEvidence,
        addGate,
        runComplianceCheck,
        deleteCapsule,
        extractObligations,
        refresh: fetchAll,
      }}
    >
      {children}
    </OCFContext.Provider>
  );
};

export const useOCF = () => {
  const ctx = useContext(OCFContext);

  if (!ctx) {
    throw new Error("useOCF must be used within OCFProvider");
  }

  return ctx;
};
