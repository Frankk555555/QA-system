"use client";

import { useEffect, useState, use } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Plus, ArrowLeft, Loader2, Calendar, Monitor, Tag } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Platform, PlatformLabels } from "@/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Build {
  id: string;
  version: string;
  platform: Platform;
  releaseDate?: string | null;
  createdAt: string;
}

interface ProjectDetail {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  builds: Build[];
  _count: {
    bugs: number;
    builds: number;
  };
  bugs: {
    status: string;
    severity: string;
    priority: string;
    createdAt: string;
  }[];
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBuildOpen, setIsBuildOpen] = useState(false);
  const [submittingBuild, setSubmittingBuild] = useState(false);

  // Build Form States
  const [version, setVersion] = useState("");
  const [platform, setPlatform] = useState<Platform>("WINDOWS");
  const [releaseDate, setReleaseDate] = useState("");

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}`);
      const json = await res.json();
      if (json.success) {
        setProject(json.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleAddBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version || !platform) return;

    setSubmittingBuild(true);
    try {
      const res = await fetch(`/api/projects/${id}/builds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version,
          platform,
          releaseDate: releaseDate ? new Date(releaseDate).toISOString() : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Build release added successfully");
        setIsBuildOpen(false);
        setVersion("");
        setPlatform("WINDOWS");
        setReleaseDate("");
        fetchProject();
      } else {
        toast.error(json.error || "Failed to add build");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding build version");
    } finally {
      setSubmittingBuild(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Project Not Found</h2>
        <Link href="/projects" className="text-primary hover:underline mt-2 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  // Calculate metrics
  const activeBugsCount = project.bugs.filter((b) => !["CLOSED", "VERIFIED", "REJECTED"].includes(b.status)).length;
  const resolvedBugsCount = project.bugs.filter((b) => ["FIXED", "VERIFIED", "CLOSED"].includes(b.status)).length;
  const criticalBugsCount = project.bugs.filter((b) => b.severity === "CRITICAL" && b.status !== "CLOSED").length;

  const canAddBuild = session?.user && ["ADMIN", "PRODUCER", "QA_TESTER"].includes((session.user as { role?: string }).role || "");

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
      </div>

      <PageHeader title={project.name} description={project.description || "No project overview description."}>
        {canAddBuild && (
          <button
            onClick={() => setIsBuildOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Build Release
          </button>
        )}
      </PageHeader>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Builds Released</p>
            <p className="text-2xl font-bold mt-1">{project.builds.length}</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Bug Reports</p>
            <p className="text-2xl font-bold mt-1 text-medium">{activeBugsCount}</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Resolved Bugs</p>
            <p className="text-2xl font-bold mt-1 text-status-fixed">{resolvedBugsCount}</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Open Critical Issues</p>
            <p className="text-2xl font-bold mt-1 text-critical animate-pulse">{criticalBugsCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Build Release Versions Timeline */}
      <div className="glass p-6 rounded-2xl border border-border/50 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Tag className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Tested Build Releases ({project.builds.length})</h3>
        </div>

        {project.builds.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No build versions added yet.</p>
        ) : (
          <div className="relative pl-6 border-l border-border space-y-6 max-h-[400px] overflow-y-auto scrollbar-thin">
            {project.builds.map((build) => (
              <div key={build.id} className="relative text-sm">
                {/* Circle bullet node */}
                <div className="absolute -left-[31px] top-0.5 bg-background border-2 border-primary w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row">
                  <div className="space-y-1">
                    <p className="font-bold text-foreground text-base">
                      {build.version}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 bg-secondary/80 border border-border px-1.5 py-0.5 rounded">
                        <Monitor className="w-3 h-3" />
                        {PlatformLabels[build.platform] || build.platform}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                    Released: {build.releaseDate ? formatDate(build.releaseDate) : formatDate(build.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Build Dialog */}
      <Dialog open={isBuildOpen} onOpenChange={setIsBuildOpen}>
        <DialogContent className="glass max-w-md border-border/50">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Build Release</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Log a new compilation version release for testing.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddBuild} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Version Tag *</label>
                <input
                  type="text"
                  placeholder="e.g. 1.0.4-rc3"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  required
                  className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Platform *</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as Platform)}
                  required
                  className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                >
                  {Object.values(Platform).map((p) => (
                    <option key={p} value={p}>
                      {PlatformLabels[p] || p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Release Date</label>
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsBuildOpen(false)}
                disabled={submittingBuild}
                className="px-4 h-9 rounded-lg bg-secondary/50 border border-border text-xs text-foreground font-semibold hover:bg-secondary transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingBuild || !version}
                className="px-5 h-9 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all text-xs flex items-center gap-1.5"
              >
                {submittingBuild && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Add Build
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
