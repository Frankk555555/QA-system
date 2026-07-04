"use client";

import { useEffect, useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { BugComments } from "@/components/bugs/BugComments";
import { formatDate, formatDateTime, getInitials } from "@/lib/utils";
import { Loader2, ArrowLeft, Shield, Monitor, Gamepad, History, UserCheck, Activity } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { BugStatus, BugSeverity, BugPriority } from "@/types";

interface Developer {
  id: string;
  name: string;
}

interface BugDetail {
  id: string;
  bugCode: string;
  title: string;
  description: string;
  stepsToReproduce?: string | null;
  expectedResult?: string | null;
  actualResult?: string | null;
  severity: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  project: { id: string; name: string };
  build?: { id: string; version: string; platform: string } | null;
  reporter: { name: string; email: string; avatar?: string | null; role: string };
  assignedTo?: { id: string; name: string; email: string; avatar?: string | null; role: string } | null;
  environmentInfo?: {
    os?: string | null;
    cpu?: string | null;
    gpu?: string | null;
    ram?: string | null;
    resolution?: string | null;
    driverVersion?: string | null;
    gameLanguage?: string | null;
    fps?: number | null;
  } | null;
  gameSession?: {
    map?: string | null;
    mission?: string | null;
    character?: string | null;
    weapon?: string | null;
    server?: string | null;
    roomId?: string | null;
  } | null;
  comments: any[];
  activityLogs: any[];
}

export default function BugDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [bug, setBug] = useState<BugDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingAssignee, setUpdatingAssignee] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bugRes, devRes] = await Promise.all([
          fetch(`/api/bugs/${id}`),
          fetch("/api/users/developers"),
        ]);
        const bugJson = await bugRes.json();
        const devJson = await devRes.json();

        if (bugJson.success) setBug(bugJson.data);
        if (devJson.success) setDevelopers(devJson.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load bug details");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/bugs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setBug((prev) => prev ? { ...prev, status: newStatus, activityLogs: [json.data, ...(prev.activityLogs || [])] } : null);
        toast.success(`Status updated to ${newStatus}`);
        // Reload page to fetch updated activity logs and fields cleanly
        router.refresh();
      } else {
        toast.error(json.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssigneeChange = async (devId: string) => {
    setUpdatingAssignee(true);
    try {
      const res = await fetch(`/api/bugs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: devId || null }),
      });
      const json = await res.json();
      if (json.success) {
        const selectedDev = developers.find((d) => d.id === devId);
        setBug((prev) =>
          prev
            ? {
                ...prev,
                assignedTo: selectedDev ? { id: selectedDev.id, name: selectedDev.name, email: "", role: "DEVELOPER" } : null,
              }
            : null
        );
        toast.success(selectedDev ? `Assigned to ${selectedDev.name}` : "Bug unassigned");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating assignee");
    } finally {
      setUpdatingAssignee(false);
    }
  };

  const activityIcon = (action?: string) => {
    if (!action) return <History className="w-3.5 h-3.5 text-muted-foreground" />;
    if (action.includes("Status")) return <Activity className="w-3.5 h-3.5 text-primary" />;
    if (action.includes("Assign")) return <UserCheck className="w-3.5 h-3.5 text-medium" />;
    return <History className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Bug Report Not Found</h2>
        <Link href="/bugs" className="text-primary hover:underline mt-2 inline-block">
          Back to Bug Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Back button */}
      <div>
        <Link
          href="/bugs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bug Reports
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-6 glass rounded-2xl border border-border/50">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded">
              {bug.bugCode}
            </span>
            <span className="text-xs text-muted-foreground">{formatDate(bug.createdAt)}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">{bug.title}</h1>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <StatusBadge status={bug.status} />
            <SeverityBadge severity={bug.severity} />
            <PriorityBadge priority={bug.priority} />
          </div>
        </div>

        {/* Quick Workflow Action Button */}
        <div className="flex flex-col gap-2 min-w-[200px]">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Update Status</label>
          <select
            value={bug.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updatingStatus}
            className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50"
          >
            {Object.values(BugStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Descriptions & Discussion */}
        <div className="md:col-span-2 space-y-6">
          {/* Detailed Info Card */}
          <div className="glass p-6 rounded-2xl border border-border/50 space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</h3>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{bug.description}</p>
            </div>

            {/* Steps to Reproduce */}
            {bug.stepsToReproduce && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Steps to Reproduce</h3>
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                  {bug.stepsToReproduce}
                </div>
              </div>
            )}

            {/* Expected & Actual Results */}
            {(bug.expectedResult || bug.actualResult) && (
              <div className="grid gap-4 md:grid-cols-2 pt-2 border-t border-border">
                {bug.expectedResult && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Expected Result</h4>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{bug.expectedResult}</p>
                  </div>
                )}
                {bug.actualResult && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-destructive">Actual Result</h4>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{bug.actualResult}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Environment Information Card */}
          {bug.environmentInfo && (
            <div className="glass p-6 rounded-2xl border border-border/50 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Monitor className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Environment Specifications</h3>
              </div>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">OS</p>
                  <p className="font-semibold mt-0.5 truncate">{bug.environmentInfo.os || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CPU</p>
                  <p className="font-semibold mt-0.5 truncate">{bug.environmentInfo.cpu || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">GPU</p>
                  <p className="font-semibold mt-0.5 truncate">{bug.environmentInfo.gpu || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">RAM</p>
                  <p className="font-semibold mt-0.5 truncate">{bug.environmentInfo.ram || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resolution</p>
                  <p className="font-semibold mt-0.5">{bug.environmentInfo.resolution || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">FPS</p>
                  <p className="font-semibold mt-0.5">{bug.environmentInfo.fps !== null ? `${bug.environmentInfo.fps} FPS` : "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Language / Driver</p>
                  <p className="font-semibold mt-0.5 truncate">
                    {bug.environmentInfo.gameLanguage || "English"} ({bug.environmentInfo.driverVersion || "N/A"})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Game Session Card */}
          {bug.gameSession && (
            <div className="glass p-6 rounded-2xl border border-border/50 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Gamepad className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Game Session Metadata</h3>
              </div>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Map / Level</p>
                  <p className="font-semibold mt-0.5 truncate">{bug.gameSession.map || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mission</p>
                  <p className="font-semibold mt-0.5 truncate">{bug.gameSession.mission || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Character</p>
                  <p className="font-semibold mt-0.5 truncate">{bug.gameSession.character || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Weapon</p>
                  <p className="font-semibold mt-0.5 truncate">{bug.gameSession.weapon || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Server</p>
                  <p className="font-semibold mt-0.5 truncate">{bug.gameSession.server || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Room ID</p>
                  <p className="font-semibold mt-0.5 font-mono">{bug.gameSession.roomId || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="glass p-6 rounded-2xl border border-border/50">
            <BugComments bugId={bug.id} initialComments={bug.comments} />
          </div>
        </div>

        {/* Right Side: Meta Sidebar & Activity Timeline */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="glass p-6 rounded-2xl border border-border/50 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Bug Context Metadata</h3>
            </div>

            <div className="space-y-3.5 text-sm">
              {/* Project */}
              <div>
                <p className="text-xs text-muted-foreground">Project</p>
                <p className="font-semibold mt-0.5">{bug.project.name}</p>
              </div>

              {/* Build */}
              <div>
                <p className="text-xs text-muted-foreground">Tested Build</p>
                <p className="font-semibold mt-0.5">
                  {bug.build ? `${bug.build.version} (${bug.build.platform})` : "No build version set"}
                </p>
              </div>

              {/* Developer Assignee Selector */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Assigned Developer</p>
                <select
                  value={bug.assignedTo?.id || ""}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  disabled={updatingAssignee}
                  className="w-full h-9 px-2 rounded bg-secondary/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50 mt-1"
                >
                  <option value="">Unassigned</option>
                  {developers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reporter */}
              <div>
                <p className="text-xs text-muted-foreground">Reporter</p>
                <div className="flex items-center gap-2 mt-1">
                  <UserAvatar name={bug.reporter.name} image={bug.reporter.avatar} size="sm" />
                  <div>
                    <p className="font-semibold text-xs leading-normal">{bug.reporter.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium capitalize">{bug.reporter.role.toLowerCase()}</p>
                  </div>
                </div>
              </div>

              {/* Date updated */}
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="font-semibold mt-0.5 text-xs text-muted-foreground">{formatDateTime(bug.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Activity Log / History Card */}
          <div className="glass p-6 rounded-2xl border border-border/50 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider border-b border-border pb-3 flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Activity Log History
            </h3>

            <div className="relative pl-4 space-y-4 border-l border-border/80 max-h-[300px] overflow-y-auto scrollbar-thin">
              {bug.activityLogs?.length === 0 ? (
                <p className="text-xs text-muted-foreground">No updates logged yet.</p>
              ) : (
                bug.activityLogs?.map((log) => (
                  <div key={log.id} className="relative text-xs">
                    {/* Circle icon */}
                    <div className="absolute -left-[23px] top-0.5 bg-background border border-border p-0.5 rounded-full flex items-center justify-center">
                      {activityIcon(log.action)}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-foreground leading-normal">
                        <span className="font-semibold">{log.user?.name}</span>{" "}
                        <span className="text-muted-foreground">{log.action?.toLowerCase() || "updated"}</span>
                      </p>
                      {log.oldValue && log.newValue && (
                        <p className="text-[10px] text-muted-foreground">
                          {log.oldValue} → <span className="text-foreground font-medium">{log.newValue}</span>
                        </p>
                      )}
                      <p className="text-[9px] text-muted-foreground">{formatDateTime(log.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
