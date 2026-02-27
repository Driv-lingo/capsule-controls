import { Shield, GitPullRequest, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

const gates = [
  {
    pr: "PR #247 — Add EU storage account",
    repo: "infra/azure-resources",
    capsules: ["US Data Residency"],
    result: "blocked" as const,
    findings: "Resource location 'westeurope' violates US-only constraint",
    time: "3 min ago",
  },
  {
    pr: "PR #245 — Update retention policy",
    repo: "compliance/purview-config",
    capsules: ["PII Retention 24mo"],
    result: "passed" as const,
    findings: "All retention labels within 24-month limit",
    time: "1 hr ago",
  },
  {
    pr: "PR #243 — Service principal update",
    repo: "identity/entra-config",
    capsules: ["MFA Enforcement", "Privileged Access Review"],
    result: "warning" as const,
    findings: "MFA passed. 1 privileged role missing access review schedule",
    time: "2 hr ago",
  },
  {
    pr: "PR #240 — New vendor integration",
    repo: "apps/vendor-portal",
    capsules: ["Vendor Data Processing"],
    result: "pending" as const,
    findings: "Capsule awaiting first compliance check run",
    time: "4 hr ago",
  },
];

const resultConfig = {
  blocked: { icon: XCircle, color: "text-destructive", status: "non-compliant" as const },
  passed: { icon: CheckCircle2, color: "text-success", status: "compliant" as const },
  warning: { icon: AlertTriangle, color: "text-warning", status: "warning" as const },
  pending: { icon: Clock, color: "text-muted-foreground", status: "pending" as const },
};

const Gatekeeper = () => (
  <div className="flex-1 overflow-auto p-6 lg:p-8">
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gatekeeper</h1>
          <p className="text-sm text-muted-foreground">
            CI/CD compliance gates — capsule checks on every change
          </p>
        </div>
      </div>
    </div>

    <div className="space-y-3">
      {gates.map((g, i) => {
        const cfg = resultConfig[g.result];
        const Icon = cfg.icon;
        return (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-4 animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
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
                    {g.capsules.map((c) => (
                      <span key={c} className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={cfg.status} label={g.result} />
                <span className="text-xs text-muted-foreground font-mono">{g.time}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default Gatekeeper;
