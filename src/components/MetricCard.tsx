import { LucideIcon } from "lucide-react";

const MetricCard = ({
  icon: Icon,
  label,
  value,
  change,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
}) => (
  <div className="rounded-lg border border-border bg-gradient-card p-5 transition-all hover:border-glow hover:glow-primary">
    <div className="flex items-center justify-between">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      {change && (
        <span
          className={`text-xs font-mono ${
            trend === "up" ? "text-success" : "text-destructive"
          }`}
        >
          {change}
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

export default MetricCard;
