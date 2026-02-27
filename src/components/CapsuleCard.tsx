import { Package, Clock, Hash } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { CapsuleRow } from "@/context/OCFContext";

type Status = "compliant" | "non-compliant" | "warning" | "pending";

const CapsuleCard = ({ capsule }: { capsule: CapsuleRow }) => (
  <div className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-glow hover:glow-primary">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{capsule.name}</h3>
          <p className="text-xs text-muted-foreground">{capsule.source}</p>
        </div>
      </div>
      <StatusBadge status={capsule.status as Status} />
    </div>
    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground font-mono">
      <span className="flex items-center gap-1">
        <Hash className="h-3 w-3" />
        {capsule.version}
      </span>
      <span className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {capsule.last_run}
      </span>
      <span>{capsule.obligations} obligations</span>
    </div>
  </div>
);

export default CapsuleCard;
