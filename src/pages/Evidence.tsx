import { FileCheck, Download, Clock, Hash, Shield } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";

const packets = [
  {
    id: "evd-001",
    capsule: "US Data Residency",
    timestamp: "2026-02-27T14:22:00Z",
    hash: "sha256:a3f8…c21d",
    checks: 12,
    passed: 12,
    status: "compliant" as const,
  },
  {
    id: "evd-002",
    capsule: "PII Retention 24mo",
    timestamp: "2026-02-27T14:08:00Z",
    hash: "sha256:b7d2…e44f",
    checks: 8,
    passed: 6,
    status: "non-compliant" as const,
  },
  {
    id: "evd-003",
    capsule: "MFA Enforcement",
    timestamp: "2026-02-27T14:17:00Z",
    hash: "sha256:c1e9…f88a",
    checks: 5,
    passed: 5,
    status: "compliant" as const,
  },
  {
    id: "evd-004",
    capsule: "Privileged Access Review",
    timestamp: "2026-02-27T13:22:00Z",
    hash: "sha256:d4a1…b33c",
    checks: 15,
    passed: 13,
    status: "warning" as const,
  },
];

const Evidence = () => (
  <div className="flex-1 overflow-auto p-6 lg:p-8">
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
          <FileCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Evidence Notary</h1>
          <p className="text-sm text-muted-foreground">
            Immutable evidence packets for audit readiness
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="gap-1.5">
        <Download className="h-3.5 w-3.5" />
        Export All
      </Button>
    </div>

    <div className="space-y-3">
      {packets.map((p, i) => (
        <div
          key={p.id}
          className="rounded-lg border border-border bg-card p-5 animate-fade-in"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{p.capsule}</h3>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(p.timestamp).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {p.hash}
                  </span>
                </div>
              </div>
            </div>
            <StatusBadge status={p.status} />
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {p.passed}/{p.checks} checks passed
                </span>
                <span className="font-mono text-foreground">
                  {((p.passed / p.checks) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    p.status === "compliant"
                      ? "bg-success"
                      : p.status === "warning"
                      ? "bg-warning"
                      : "bg-destructive"
                  }`}
                  style={{ width: `${(p.passed / p.checks) * 100}%` }}
                />
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Download className="h-3 w-3" />
              Download
            </Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Evidence;
