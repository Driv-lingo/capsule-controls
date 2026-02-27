import { FileCheck, Download, Clock, Hash, Shield } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useOCF } from "@/context/OCFContext";
import { toast } from "@/hooks/use-toast";

const Evidence = () => {
  const { evidence } = useOCF();

  const handleDownload = (packet: typeof evidence[0]) => {
    const blob = new Blob([JSON.stringify({
      id: packet.id,
      capsule: packet.capsule,
      timestamp: packet.timestamp,
      hash: packet.hash,
      checks: packet.checks,
      passed: packet.passed,
      status: packet.status,
      signer: "KeyVault/ocf-signing-key",
      format: "OCF Evidence Packet v1.0",
    }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${packet.id}-evidence.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: `Evidence packet ${packet.id}` });
  };

  const handleExportAll = () => {
    const blob = new Blob([JSON.stringify(evidence.map((p) => ({
      ...p,
      signer: "KeyVault/ocf-signing-key",
      format: "OCF Evidence Packet v1.0",
    })), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ocf-evidence-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${evidence.length} evidence packets` });
  };

  return (
    <div className="flex-1 overflow-auto p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
            <FileCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Evidence Notary</h1>
            <p className="text-sm text-muted-foreground">Immutable evidence packets for audit readiness</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportAll} disabled={evidence.length === 0}>
          <Download className="h-3.5 w-3.5" />
          Export All ({evidence.length})
        </Button>
      </div>

      <div className="space-y-3">
        {evidence.map((p, i) => (
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
                  <span className="text-muted-foreground">{p.passed}/{p.checks} checks passed</span>
                  <span className="font-mono text-foreground">{((p.passed / p.checks) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      p.status === "compliant" ? "bg-success" : p.status === "warning" ? "bg-warning" : "bg-destructive"
                    }`}
                    style={{ width: `${(p.passed / p.checks) * 100}%` }}
                  />
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleDownload(p)}>
                <Download className="h-3 w-3" />
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>

      {evidence.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FileCheck className="mb-3 h-8 w-8" />
          <p className="text-sm">No evidence packets yet. Run a compliance check to generate one.</p>
        </div>
      )}
    </div>
  );
};

export default Evidence;
