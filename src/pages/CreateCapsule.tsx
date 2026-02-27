import { useState } from "react";
import { ArrowRight, FileText, Cpu, Package, CheckCircle2, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { obligations, controlMappings } from "@/data/mockData";

const steps = [
  { icon: FileText, label: "Extract" },
  { icon: Cpu, label: "Map" },
  { icon: Package, label: "Compile" },
  { icon: Lock, label: "Sign" },
];

const exampleClause = `"Customer PII must remain in US regions, be retained no longer than 24 months, and access must require MFA. Exceptions must be logged and approved."`;

const CreateCapsule = () => {
  const [clause, setClause] = useState("");
  const [step, setStep] = useState(0); // 0=input, 1=extracting, 2=mapping, 3=compiling, 4=done
  const [processing, setProcessing] = useState(false);

  const handleStart = () => {
    if (!clause.trim()) return;
    setProcessing(true);
    setStep(1);
    // Simulate extraction
    setTimeout(() => { setStep(2); }, 1200);
    setTimeout(() => { setStep(3); }, 2400);
    setTimeout(() => { setStep(4); setProcessing(false); }, 3600);
  };

  return (
    <div className="flex-1 overflow-auto p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Create Capsule</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste an obligation clause to extract, map, and compile a control capsule
        </p>
      </div>

      {/* Pipeline Steps */}
      <div className="mb-8 flex items-center gap-2">
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
            <h2 className="mb-3 text-sm font-semibold text-foreground">Extracted Obligations</h2>
            <div className="space-y-2">
              {obligations.map((o) => (
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
                    {controlMappings.map((m, i) => (
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
                      us-data-residency-pii-mfa v1.0.0 · sha256:a3f8…c21d
                    </p>
                  </div>
                </div>
                <StatusBadge status="compliant" label="Ready" />
              </div>
              <div className="mt-4 rounded-md bg-muted/50 p-3 font-mono text-xs text-muted-foreground">
                <pre>{`{
  "capsule": "us-data-residency-pii-mfa",
  "version": "1.0.0",
  "obligations": 4,
  "controls": 4,
  "signed": true,
  "signer": "KeyVault/ocf-signing-key",
  "timestamp": "${new Date().toISOString()}"
}`}</pre>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="gap-1.5">
                  <Package className="h-3.5 w-3.5" />
                  Publish to Registry
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
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
