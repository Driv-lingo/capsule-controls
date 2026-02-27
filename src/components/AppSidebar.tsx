import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Plus,
  Package,
  Shield,
  FileCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Plus, label: "Create Capsule", path: "/create" },
  { icon: Package, label: "Registry", path: "/registry" },
  { icon: Shield, label: "Gatekeeper", path: "/gatekeeper" },
  { icon: FileCheck, label: "Evidence", path: "/evidence" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const AppSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col border-r border-border bg-sidebar transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gradient-primary">
          <Shield className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <span className="text-sm font-bold tracking-tight text-foreground">OCF</span>
            <span className="ml-1 text-xs text-muted-foreground">v1.0.0</span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all ${
                active
                  ? "bg-primary/10 text-primary glow-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="animate-fade-in">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="m-2 flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
};

export default AppSidebar;
