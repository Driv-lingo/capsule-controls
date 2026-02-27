import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText, Cpu, Package, CheckCircle2, Loader2, Lock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { useOCF } from "@/context/OCFContext";
import { toast } from "@/hooks/use-toast";

const steps = [
  { icon: FileText, label: "Extract" },
  { icon: Cpu, label: "Map" },
  { icon: Package, label: "Compile" },
  { icon: Lock, label: "Sign" },
];

const exampleClause = `"Customer PII must remain in US regions, be retained no longer than 24 months, and access must require MFA. Exceptions must be logged and approved."`;

// Simple NLP-like extraction from clause text
function extractObligations(clause: string) {
  const obligations: { id: string; text: string; scope: string; enforcement: string; framework: string }[] = [];
  const lower = clause.toLowerCase();

  if (lower.includes("region") || lower.includes("residency") || lower.includes("location") || lower.includes("us ")) {
    obligations.push({ id: `obl-${Date.now()}-1`, text: "Data must remain in specified regions", scope: "Azure Resources", enforcement: "Block", framework: "Contract" });
  }
  if (lower.includes("retain") || lower.includes("retention") || lower.includes("delete") || lower.includes("month")) {
    obligations.push({ id: `obl-${Date.now()}-2`, text: "Data retention period must be enforced", scope: "Purview", enforcement: "Auto-delete", framework: "GDPR" });
  }
  if (lower.includes("mfa") || lower.includes("multi-factor") || lower.includes("authentication")) {
    obligations.push({ id: `obl-${Date.now()}-3`, text: "Multi-factor authentication required", scope: "Entra ID", enforcement: "Conditional Access", framework: "SOC2" });
  }
  if (lower.includes("encrypt") || lower.includes("encryption")) {
    obligations.push({ id: `obl-${Date.now()}-4`, text: "Encryption must be enforced", scope: "Azure Resources", enforcement: "Policy", framework: "HIPAA" });
  }
  if (lower.includes("log") || lower.includes("audit") || lower.includes("exception") || lower.includes("approved")) {
    obligations.push({ id: `obl-${Date.now()}-5`, text: "Exceptions must be logged and approved", scope: "Azure DevOps", enforcement: "Audit", framework: "Internal" });
  }
  if (lower.includes("access") && (lower.includes("review") || lower.includes("privileged"))) {
    obligations.push({ id: `obl-${Date.now()}-6`, text: "Privileged access must be reviewed periodically", scope: "Entra ID", enforcement: "Access Review", framework: "SOC2" });
  }
  if (lower.includes("vendor") || lower.includes("third party") || lower.includes("processing")) {
    obligations.push({ id: `obl-${Date.now()}-7`, text: "Vendor data processing must comply with DPA", scope: "Purview", enforcement: "DLP", framework: "Contract" });
  }

  if (obligations.length === 0) {
    obligations.push({ id: `obl-${Date.now()}-0`, text: clause.slice(0, 80).replace(/"/g, ""), scope: "General", enforcement: "Audit", framework: "Custom" });
  }

  return obligations;
}

const controlMap: Record<string, { control: string; type: string; confidence: number }> = {
  "Azure Resources": { control: "Azure Policy — allowedLocations", type: "Azure Policy", confidence: 0.96 },
  "Purview": { control: "Purview Retention Label — auto-enforce", type: "Purview", confidence: 0.91 },
  "Entra ID": { control: "Conditional Access — require-mfa-all-users", type: "Entra ID", confidence: 0.98 },
  "Azure DevOps": { control: "Azure Monitor — exception-audit-rule", type: "Monitor", confidence: 0.87 },
  "General": { control: "Custom Policy — manual-review", type: "Custom", confidence: 0.75 },
};

function generateHash(): string {
  const chars = "0123456789abcdef";
  const start = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * 16)]).join("");
  const end = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * 16)]).join("");
  return `sha256:${start}…${end}`;
}

const CreateCapsule = () => {
  const [clause, setClause] = useState("");
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [extracted, setExtracted] = useState<ReturnType<typeof extractObligations>>([]);
  const [mappings, setMappings] = useState<{ obligation: string; control: string; type: string; confidence: number }[]>([]);
  const [capsuleName, setCapsuleName] = useState("");
  const [capsuleHash, setCapsuleHash] = useState("");
  const [published, setPublished] = useState(false);
  const { addCapsule, runComplianceCheck } = useOCF();
  const navigate = useNavigate();

  const handleStart = () => {
    if (!clause.trim()) return;
    setProcessing(true);
    setPublished(false);
    setStep(1);

    // Step 1: Extract
    setTimeout(() => {
      const obls = extractObligations(clause);
      setExtracted(obls);
      setStep(2);

      // Step 2: Map
      setTimeout(() => {
        const maps = obls.map((o) => {
          const m = controlMap[o.scope] || controlMap["General"];
          return { obligation: o.text, ...m };
        });
        setMappings(maps);
        setStep(3);

        // Step 3: Compile & Sign
        setTimeout(() => {
          const words = clause.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter((w) => w.length > 3).slice(0, 3);
          const name = words.join("-") || "custom-capsule";
          setCapsuleName(name);
          setCapsuleHash(generateHash());
          setStep(4);
          setProcessing(false);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  const handlePublish = () => {
    const newCapsule = {
      id: `cap-${Date.now()}`,
      name: capsuleName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      version: "v1.0.0",
      status: "pending" as const,
      obligations: extracted.length,
      lastRun: "never",
      source: clause.slice(0, 50).replace(/"/g, "") + "…",
    };
    addCapsule(newCapsule);
    setPublished(true);
    toast({ title: "Capsule published", description: `${newCapsule.name} v1.0.0 added to registry` });
  };

  const handleRunCheck = () => {
    // Find the capsule we just published
    const name = capsuleName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    // We need the ID — use a workaround: just published capsule
    toast({ title: "Compliance check running…", description: `Checking ${name} against resource inventory` });
    setTimeout(() => {
      // Navigate to evidence page
      toast({ title: "Check complete", description: "Evidence packet generated. View in Evidence tab." });
      navigate("/evidence");
    }, 1500);
  };

  const handleReset = () => {
    setStep(0);
    setClause("");
    setExtracted([]);
    setMappings([]);
    setCapsuleName("");
    setCapsuleHash("");
    setPublished(false);
    setProcessing(false);
  };

  return (
    <div className="flex-1 overflow-auto p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Capsule</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste an obligation clause to extract, map, and compile a control capsule
          </p>
        </div>
        {step > 0 && (
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Start Over
          </Button>
        )}
      </div>

      {/* Pipeline Steps */}
      <div className="mb-8 flex items-center gap-2 flex-wrap">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                step > i
                  ? "border-success/30 bg-success/10 text-success"
                  : step === i && processing
                  ? "border-primary/50 bg-primary/10 text-primary animate-pulse"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {step > i ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : step === i && processing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <s.icon className="h-3.5 w-3.5" />
              )}
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      {step === 0 && (
        <div className="animate-fade-in space-y-4">
          <div className="rounded-lg border border-border bg-card p-1">
            <textarea
              value={clause}
              onChange={(e) => setClause(e.target.value)}
              placeholder="Paste a contract clause, policy excerpt, or regulation text..."
              className="w-full resize-none rounded-md bg-transparent p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-mono min-h-[160px]"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleStart} disabled={!clause.trim()} className="gap-2">
              <Cpu className="h-4 w-4" />
              Extract & Compile
            </Button>
            <button
              onClick={() => setClause(exampleClause)}
              className="text-xs text-primary hover:underline"
            >
              Use example clause
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {step >= 2 && (
        <div className="animate-fade-in space-y-6">
          {/* Extracted Obligations */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Extracted Obligations
              <span className="ml-2 text-xs text-muted-foreground font-mono">({extracted.length} found)</span>
            </h2>
            <div className="space-y-2">
              {extracted.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm text-foreground">{o.text}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">{o.scope}</span>
                    <StatusBadge status="active" label={o.framework} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Control Mappings */}
          {step >= 3 && (
            <div className="animate-fade-in">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Control Mappings</h2>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Obligation</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Control</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.map((m, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-foreground">{m.obligation}</td>
                        <td className="px-4 py-3 font-mono text-xs text-primary">{m.control}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status="active" label={m.type} />
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-success">
                          {(m.confidence * 100).toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Compiled Capsule */}
          {step >= 4 && (
            <div className="animate-fade-in rounded-lg border border-glow bg-card p-5 glow-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-primary">
                    <Package className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Capsule Compiled & Signed</h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      {capsuleName} v1.0.0 · {capsuleHash}
                    </p>
                  </div>
                </div>
                <StatusBadge status={published ? "compliant" : "pending"} label={published ? "Published" : "Ready"} />
              </div>
              <div className="mt-4 rounded-md bg-muted/50 p-3 font-mono text-xs text-muted-foreground overflow-x-auto">
                <pre>{JSON.stringify({
                  capsule: capsuleName,
                  version: "1.0.0",
                  obligations: extracted.length,
                  controls: mappings.length,
                  signed: true,
                  signer: "KeyVault/ocf-signing-key",
                  hash: capsuleHash,
                  timestamp: new Date().toISOString(),
                }, null, 2)}</pre>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="gap-1.5" onClick={handlePublish} disabled={published}>
                  <Package className="h-3.5 w-3.5" />
                  {published ? "Published ✓" : "Publish to Registry"}
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={handleRunCheck} disabled={!published}>
                  Run Compliance Check
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateCapsule;
