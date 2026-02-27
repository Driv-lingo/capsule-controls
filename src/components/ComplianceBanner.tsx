import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { useOCF } from "@/context/OCFContext";

const ComplianceBanner = () => {
  const { capsules, loading } = useOCF();
  if (loading) return null;

  const nonCompliant = capsules.filter(c => c.status === "non-compliant");
  const warnings = capsules.filter(c => c.status === "warning");
  const allCompliant = nonCompliant.length === 0 && warnings.length === 0 && capsules.length > 0;

  if (capsules.length === 0) return null;

  if (allCompliant) {
    return (
      <div className="mx-6 mt-4 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span className="text-xs font-medium text-success">All capsules compliant — operations unblocked</span>
        </div>
      </div>
    );
  }

  if (nonCompliant.length > 0) {
    return (
      <div className="mx-6 mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
        <div className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p className="text-xs font-semibold text-destructive">
              🚨 {nonCompliant.length} non-compliant capsule{nonCompliant.length > 1 ? "s" : ""} — enforcement active
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {nonCompliant.map(c => c.name).join(", ")} must be remediated before CI/CD gates will pass.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-6 mt-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <span className="text-xs font-medium text-warning">
          {warnings.length} capsule{warnings.length > 1 ? "s" : ""} need attention — review recommended
        </span>
      </div>
    </div>
  );
};

export default ComplianceBanner;
