import { Settings as SettingsIcon, Shield, Key, Globe, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOCF } from "@/context/OCFContext";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const Settings = () => {
  const { capsules, evidence } = useOCF();
  const [autoRemediate, setAutoRemediate] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [schedule, setSchedule] = useState("hourly");

  return (
    <div className="flex-1 overflow-auto p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure OCF behavior and integrations</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Signing */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <Key className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Signing Configuration</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Key Vault</span>
              <span className="text-sm font-mono text-foreground">ocf-keyvault-prod</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Signing Key</span>
              <span className="text-sm font-mono text-foreground">ocf-signing-key-v2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Algorithm</span>
              <span className="text-sm font-mono text-foreground">RS256</span>
            </div>
          </div>
        </div>

        {/* Evidence Schedule */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Evidence Collection</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Schedule</span>
              <select
                value={schedule}
                onChange={(e) => {
                  setSchedule(e.target.value);
                  toast({ title: "Schedule updated", description: `Evidence collection set to ${e.target.value}` });
                }}
                className="rounded-md border border-border bg-muted px-3 py-1.5 text-sm text-foreground focus:outline-none"
              >
                <option value="15min">Every 15 minutes</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total capsules monitored</span>
              <span className="text-sm font-mono text-foreground">{capsules.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total evidence packets</span>
              <span className="text-sm font-mono text-foreground">{evidence.length}</span>
            </div>
          </div>
        </div>

        {/* Remediation */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Remediation</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-foreground">Auto-remediate low-risk findings</span>
                <p className="text-xs text-muted-foreground">Automatically create PRs for safe fixes</p>
              </div>
              <button
                onClick={() => {
                  setAutoRemediate(!autoRemediate);
                  toast({ title: autoRemediate ? "Auto-remediation disabled" : "Auto-remediation enabled" });
                }}
                className={`relative h-6 w-11 rounded-full transition-colors ${autoRemediate ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${autoRemediate ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-foreground">Compliance alerts</span>
                <p className="text-xs text-muted-foreground">Get notified on non-compliance events</p>
              </div>
              <button
                onClick={() => {
                  setNotifications(!notifications);
                  toast({ title: notifications ? "Notifications disabled" : "Notifications enabled" });
                }}
                className={`relative h-6 w-11 rounded-full transition-colors ${notifications ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${notifications ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
