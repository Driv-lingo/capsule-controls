import { Shield, GitPullRequest, CheckCircle2, XCircle, Clock, AlertTriangle, Play } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { useOCF } from "@/context/OCFContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

type ResultKey = "blocked" | "passed" | "warning" | "pending";
const resultConfig: Record<ResultKey, { icon: typeof XCircle; color: string; status: "non-compliant" | "compliant" | "warning" | "pending" }> = {
  blocked: { icon: XCircle, color: "text-destructive", status: "non-compliant" },
  passed: { icon: CheckCircle2, color: "text-success", status: "compliant" },
  warning: { icon: AlertTriangle, color: "text-warning", status: "warning" },
  pending: { icon: Clock, color: "text-muted-foreground", status: "pending" },
};

const Gatekeeper = () => {
  const { gates, capsules, addGate, runComplianceCheck, loading } = useOCF();
  const [simulating, setSimulating] = useState(false);

  const handleSimulateGate = async () => {
    if (capsules.length === 0) {
      toast({ title: "No capsules", description: "Create and publish a capsule first" });
      return;
    }
    setSimulating(true);
    const randomCapsule = capsules[Math.floor(Math.random() * capsules.length)];
    const prNum = Math.floor(Math.random() * 100) + 250;
    const repos = ["infra/azure-resources", "apps/frontend", "identity/entra-config", "compliance/purview-config"];
    const repo = repos[Math.floor(Math.random() * repos.length)];

    const evidence = await runComplianceCheck(randomCapsule.id);
    if (evidence) {
      const result = evidence.status === "compliant" ? "passed" : evidence.status === "warning" ? "warning" : "blocked";
      await addGate({
        pr: `PR #${prNum} — Simulated change`,
        repo,
        capsule_names: [randomCapsule.name],
        result,
        findings: evidence.status === "compliant"
          ? `All ${evidence.checks} checks passed`
          : `${evidence.checks - evidence.passed} of ${evidence.checks} checks failed`,
      });
      toast({
        title: result === "passed" ? "Gate passed ✓" : result === "warning" ? "Gate warning ⚠" : "Gate blocked ✗",
        description: `PR #${prNum} checked against ${randomCapsule.name}`,
      });
    }
    setSimulating(false);
  };

  if (loading) {
    return <div className="flex flex-1 items-center justify-center"><div className="text-sm text-muted-foreground">Loading...</div></div>;
  }

  return (
    <div className="flex-1 overflow-auto p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gatekeeper</h1>
            <p className="text-sm text-muted-foreground">CI/CD compliance gates — capsule checks on every change</p>
          </div>
        </div>
        <Button onClick={handleSimulateGate} disabled={simulating} className="gap-1.5">
          <Play className="h-3.5 w-3.5" />
          {simulating ? "Simulating…" : "Simulate Gate Check"}
        </Button>
      </div>

      <div className="space-y-3">
        {gates.map((g, i) => {
          const cfg = resultConfig[(g.result as ResultKey)] || resultConfig.pending;
          const Icon = cfg.icon;
          return (
            <div key={g.id} className="rounded-lg border border-border bg-card p-4 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.color}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <GitPullRequest className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">{g.pr}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground font-mono">{g.repo}</p>
                    <p className="mt-2 text-xs text-foreground/80">{g.findings}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {g.capsule_names.map((c) => (
                        <span key={c} className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={cfg.status} label={g.result} />
                  <span className="text-xs text-muted-foreground font-mono">{formatDistanceToNow(new Date(g.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {gates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Shield className="mb-3 h-8 w-8" />
          <p className="text-sm">No gate checks yet</p>
        </div>
      )}
    </div>
  );
};

export default Gatekeeper;
