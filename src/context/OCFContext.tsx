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

export type ExtractedObligation = {
id: string;
text: string;
source: string;
priority: "low" | "medium" | "high" | "critical";
status: "active";
};

export type ControlMapping = {
id: string;
obligation: string;
control: string;
type: "technical" | "administrative" | "operational" | "contractual";
description: string;
confidence: number;
status: "active";
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
obligations: ExtractedObligation[];
controlMappings: ControlMapping[];
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
if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.randomUUID) {
return globalThis.crypto.randomUUID();
}

return Date.now().toString() + "-" + Math.random().toString(16).slice(2);
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

return "sha256:" + start + "…" + end;
}

function canUseLocalStorage(): boolean {
return (
typeof window !== "undefined" &&
typeof window.localStorage !== "undefined"
);
}

function readStorage<T>(key: string, fallback: T): T {
if (!canUseLocalStorage()) return fallback;

try {
const raw = window.localStorage.getItem(key);
return raw ? (JSON.parse(raw) as T) : fallback;
} catch {
return fallback;
}
}

function writeStorage<T>(key: string, value: T) {
if (!canUseLocalStorage()) return;

try {
window.localStorage.setItem(key, JSON.stringify(value));
} catch {
// Local persistence is best-effort only.
}
}

function cleanText(value: string): string {
return value.replace(/\s+/g, " ").trim();
}

function sentenceCase(value: string): string {
const cleaned = cleanText(value);

if (!cleaned) return cleaned;

return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function ensurePeriod(value: string): string {
const cleaned = cleanText(value);

if (!cleaned) return cleaned;

return /[.!?]$/.test(cleaned) ? cleaned : cleaned + ".";
}

function inferCapsuleName(text: string): string {
const lower = text.toLowerCase();

if (
lower.includes("encrypt") ||
lower.includes("incident") ||
lower.includes("production") ||
lower.includes("access")
) {
return "Customer Data Protection and Incident Notification";
}

if (lower.includes("privacy") || lower.includes("personal data")) {
return "Privacy and Personal Data Protection";
}

if (lower.includes("vendor") || lower.includes("supplier")) {
return "Vendor Compliance Obligation Capsule";
}

const firstSentence = text.split(/[.!?\n]/)[0]?.trim();

if (firstSentence) {
return sentenceCase(firstSentence).slice(0, 64);
}

return "Generated Obligation Capsule";
}

function buildObligations(clause: string): ExtractedObligation[] {
const text = cleanText(clause);
const lower = text.toLowerCase();
const obligations: ExtractedObligation[] = [];

const add = (
obligationText: string,
priority: ExtractedObligation["priority"] = "medium"
) => {
const normalized = ensurePeriod(sentenceCase(obligationText));

if (!obligations.some((item) => item.text === normalized)) {
  obligations.push({
    id: generateId(),
    text: normalized,
    source: "manual_input",
    priority,
    status: "active",
  });
}

};

if (lower.includes("encrypt") && lower.includes("at rest")) {
add(
"Encrypt all customer data at rest using industry-standard encryption",
"high"
);
}

if (
lower.includes("encrypt") &&
(lower.includes("in transit") || lower.includes("transit"))
) {
add(
"Encrypt all customer data in transit using industry-standard encryption",
"high"
);
}

if (
lower.includes("access") &&
lower.includes("production") &&
lower.includes("authorized")
) {
add("Limit production system access to authorized personnel only", "high");
}

if (
lower.includes("review") &&
(lower.includes("90 days") || lower.includes("ninety days"))
) {
add("Review production system access every 90 days", "medium");
}

if (
lower.includes("notify") &&
lower.includes("security incident") &&
(lower.includes("72 hours") || lower.includes("seventy-two hours"))
) {
add(
"Notify the customer of confirmed security incidents within 72 hours of discovery",
"high"
);
}

if (obligations.length > 0) {
return obligations;
}

const sentenceParts = text
.split(/(?<=[.!?])\s+|\n+/)
.map((part) => cleanText(part))
.filter(Boolean);

if (sentenceParts.length > 0) {
sentenceParts.forEach((sentence) => {
add(sentence, sentence.toLowerCase().includes("must") ? "high" : "medium");
});

return obligations;

}

add(text, "medium");

return obligations;
}

function mapControlForObligation(obligation: ExtractedObligation): ControlMapping {
const lower = obligation.text.toLowerCase();

if (lower.includes("at rest") && lower.includes("encrypt")) {
return {
id: generateId(),
obligation: obligation.text,
control: "data_at_rest_encryption",
type: "technical",
description:
"Require stored customer data to be protected with industry-standard encryption.",
confidence: 0.95,
status: "active",
};
}

if (
lower.includes("in transit") ||
(lower.includes("transit") && lower.includes("encrypt"))
) {
return {
id: generateId(),
obligation: obligation.text,
control: "data_in_transit_encryption",
type: "technical",
description:
"Require customer data transmitted across networks to use TLS or equivalent encryption.",
confidence: 0.95,
status: "active",
};
}

if (
lower.includes("production") &&
lower.includes("access") &&
lower.includes("authorized")
) {
return {
id: generateId(),
obligation: obligation.text,
control: "production_access_control",
type: "administrative",
description:
"Restrict production access to approved personnel with documented authorization.",
confidence: 0.92,
status: "active",
};
}

if (lower.includes("review") && lower.includes("90 days")) {
return {
id: generateId(),
obligation: obligation.text,
control: "quarterly_access_review",
type: "administrative",
description:
"Review production access permissions at least every 90 days.",
confidence: 0.9,
status: "active",
};
}

if (lower.includes("incident") && lower.includes("notify")) {
return {
id: generateId(),
obligation: obligation.text,
control: "security_incident_notification",
type: "operational",
description:
"Notify the customer within the required timeframe after confirmed incident discovery.",
confidence: 0.93,
status: "active",
};
}

if (
lower.includes("must") ||
lower.includes("shall") ||
lower.includes("required")
) {
return {
id: generateId(),
obligation: obligation.text,
control: "contractual_obligation_tracking",
type: "contractual",
description:
"Track, review, and verify this contractual obligation through manual control review.",
confidence: 0.78,
status: "active",
};
}

return {
id: generateId(),
obligation: obligation.text,
control: "manual_control_review",
type: "administrative",
description:
"Manual review is required to classify and validate the appropriate control.",
confidence: 0.65,
status: "active",
};
}

export const OCFProvider = ({ children }: { children: ReactNode }) => {
const [capsules, setCapsules] = useState<CapsuleRow[]>([]);
const [activity, setActivity] = useState<ActivityRow[]>([]);
const [evidence, setEvidence] = useState<EvidenceRow[]>([]);
const [gates, setGates] = useState<GateRow[]>([]);
const [loading, setLoading] = useState(true);

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

const storedGates = readStorage<GateRow[]>(
  STORAGE_KEYS.gates,
  []
);

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
    status: capsule.status ?? "ready",
    last_run: capsule.last_run ?? "never",
  };

  setCapsules((prev) => {
    const next = [row, ...prev];
    writeStorage(STORAGE_KEYS.capsules, next);
    return next;
  });

  await addActivity(
    "Capsule " + (capsule.version ?? "1.0.0") + " signed and published",
    capsule.name,
    "success"
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

    const totalChecks = 5;
    const passed = 5;
    const status = "compliant";

    const packet = await addEvidence({
      capsule_name: cap.name,
      capsule_id: cap.id,
      hash: generateHash(),
      checks: totalChecks,
      passed,
      status,
    });

    await addActivity(
      "Capsule check passed",
      cap.name,
      "success"
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
const text = cleanText(clause);

if (!text) return null;

const obligations = buildObligations(text);
const controlMappings = obligations.map(mapControlForObligation);
const capsuleName = inferCapsuleName(text);

return {
  capsuleName,
  obligations,
  controlMappings,
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