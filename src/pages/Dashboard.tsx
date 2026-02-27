import { Package, Shield, AlertTriangle, FileCheck, Activity, CheckCircle2, XCircle, Info, AlertCircle } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import CapsuleCard from "@/components/CapsuleCard";
import { capsules, recentActivity } from "@/data/mockData";

const activityIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const activityColors = {
  success: "text-success",
  error: "text-destructive",
  warning: "text-warning",
  info: "text-primary",
};

const Dashboard = () => (
  <div className="flex-1 overflow-auto p-6 lg:p-8">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-foreground">Compliance Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Obligation Capsule Fabric — continuous enforcement & evidence
      </p>
    </div>

    {/* Metrics */}
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard icon={Package} label="Active Capsules" value="6" change="+2 this week" trend="up" />
      <MetricCard icon={Shield} label="Compliance Rate" value="83%" change="-4%" trend="down" />
      <MetricCard icon={AlertTriangle} label="Open Findings" value="3" change="+1 today" trend="down" />
      <MetricCard icon={FileCheck} label="Evidence Packets" value="142" change="+12 today" trend="up" />
    </div>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* Capsule Grid */}
      <div className="xl:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Capsule Registry</h2>
          <span className="text-xs text-muted-foreground font-mono">{capsules.length} capsules</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {capsules.map((c) => (
            <CapsuleCard key={c.id} capsule={c} />
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Activity</h2>
        </div>
        <div className="space-y-1">
          {recentActivity.map((a, i) => {
            const Icon = activityIcons[a.type];
            return (
              <div
                key={i}
                className="flex items-start gap-3 rounded-md border border-border bg-card p-3 animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${activityColors[a.type]}`} />
                <div className="min-w-0">
                  <p className="text-xs text-foreground">{a.event}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {a.capsule} · {a.time}
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

export default Dashboard;
