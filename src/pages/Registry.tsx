import { Package, Search, Filter } from "lucide-react";
import CapsuleCard from "@/components/CapsuleCard";
import { capsules } from "@/data/mockData";
import { useState } from "react";

const Registry = () => {
  const [search, setSearch] = useState("");
  const filtered = capsules.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Capsule Registry</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed, versioned compliance capsules
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Package className="h-4 w-4 text-primary" />
          {capsules.length} packages
        </div>
      </div>

      {/* Search */}
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
        <button className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
          <Filter className="h-3.5 w-3.5" />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <CapsuleCard key={c.id} capsule={c} />
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
