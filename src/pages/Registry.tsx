import { Package, Search, Filter, Play, Trash2 } from "lucide-react";
import CapsuleCard from "@/components/CapsuleCard";
import { useOCF } from "@/context/OCFContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Registry = () => {
  const { capsules, runComplianceCheck, deleteCapsule } = useOCF();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = capsules.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.source.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRunCheck = (capsuleId: string, capsuleName: string) => {
    toast({ title: "Running compliance check…", description: `Checking ${capsuleName}` });
    setTimeout(() => {
      const result = runComplianceCheck(capsuleId);
      toast({
        title: result.status === "compliant" ? "✓ Compliant" : result.status === "warning" ? "⚠ Warning" : "✗ Non-compliant",
        description: `${result.passed}/${result.checks} checks passed for ${capsuleName}`,
      });
    }, 800);
  };

  const handleDelete = (capsuleId: string, capsuleName: string) => {
    deleteCapsule(capsuleId);
    toast({ title: "Capsule removed", description: `${capsuleName} removed from registry` });
  };

  return (
    <div className="flex-1 overflow-auto p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Capsule Registry</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed, versioned compliance capsules</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Package className="h-4 w-4 text-primary" />
          {capsules.length} packages
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search capsules..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="compliant">Compliant</option>
          <option value="non-compliant">Non-Compliant</option>
          <option value="warning">Warning</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="flex items-center gap-3">
            <div className="flex-1">
              <CapsuleCard capsule={c} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleRunCheck(c.id, c.name)}>
                <Play className="h-3 w-3" />
                Run
              </Button>
              <Button size="sm" variant="outline" className="gap-1 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(c.id, c.name)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Package className="mb-3 h-8 w-8" />
          <p className="text-sm">No capsules match your search</p>
        </div>
      )}
    </div>
  );
};

export default Registry;
