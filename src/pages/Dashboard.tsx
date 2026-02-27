import { Package, Shield, AlertTriangle, FileCheck, Activity, CheckCircle2, XCircle, Info, AlertCircle } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import CapsuleCard from "@/components/CapsuleCard";
import { useOCF } from "@/context/OCFContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const activityIcons = { success: CheckCircle2, error: XCircle, warning: AlertCircle, info: Info };
const activityColors = { success: "text-success", error: "text-destructive", warning: "text-warning", info: "text-primary" };

const Dashboard = () => {
  const { capsules, activity, evidence, loading } = useOCF();
  const navigate = useNavigate();

  const compliantCount = capsules.filter((c) => c.status === "compliant").length;
  const complianceRate = capsules.length > 0 ? Math.round((compliantCount / capsules.length) * 100) : 0;
  const openFindings = capsules.filter((c) => c.status === "non-compliant" || c.status === "warning").length;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compliance Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Obligation Capsule Fabric — continuous enforcement & evidence</p>
        </div>
        <Button onClick={() => navigate("/create")} className="gap-2">
          <Package className="h-4 w-4" />
          New Capsule
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Package} label="Active Capsules" value={String(capsules.length)} />
        <MetricCard icon={Shield} label="Compliance Rate" value={`${complianceRate}%`} change={complianceRate >= 80 ? "Healthy" : "At risk"} trend={complianceRate >= 80 ? "up" : "down"} />
        <MetricCard icon={AlertTriangle} label="Open Findings" value={String(openFindings)} trend={openFindings > 0 ? "down" : "up"} />
        <MetricCard icon={FileCheck} label="Evidence Packets" value={String(evidence.length)} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Capsule Registry</h2>
            <button onClick={() => navigate("/registry")} className="text-xs text-primary hover:underline">View all</button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {capsules.slice(0, 6).map((c) => (
              <CapsuleCard key={c.id} capsule={c} />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Activity</h2>
          </div>
          <div className="space-y-1">
            {activity.slice(0, 8).map((a, i) => {
              const Icon = activityIcons[a.event_type as keyof typeof activityIcons] || Info;
              const color = activityColors[a.event_type as keyof typeof activityColors] || "text-primary";
              return (
                <div key={a.id} className="flex items-start gap-3 rounded-md border border-border bg-card p-3 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
                  <div className="min-w-0">
                    <p className="text-xs text-foreground">{a.event}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {a.capsule_name} · {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
