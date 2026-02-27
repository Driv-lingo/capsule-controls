import { cn } from "@/lib/utils";

type Status = "compliant" | "non-compliant" | "warning" | "pending" | "active";

const statusStyles: Record<Status, string> = {
  compliant: "bg-success/15 text-success border-success/30",
  "non-compliant": "bg-destructive/15 text-destructive border-destructive/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  pending: "bg-muted text-muted-foreground border-border",
  active: "bg-primary/15 text-primary border-primary/30",
};

const StatusBadge = ({ status, label }: { status: Status; label?: string }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium font-mono",
      statusStyles[status]
    )}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-slow" />
    {label || status}
  </span>
);

export default StatusBadge;
