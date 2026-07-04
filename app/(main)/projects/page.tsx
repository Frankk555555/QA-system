"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Plus, FolderKanban, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  _count: {
    bugs: number;
    builds: number;
  };
}

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      if (json.success) {
        setProjects(json.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Project created successfully");
        setIsCreateOpen(false);
        setName("");
        setDescription("");
        fetchProjects();
      } else {
        toast.error(json.error || "Failed to create project");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const isAdminOrProducer = session?.user && ["ADMIN", "PRODUCER"].includes((session.user as { role?: string }).role || "");

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <PageHeader
        title="Projects"
        description="Manage gaming projects, track builds release versions, and aggregate bug metrics."
      >
        {isAdminOrProducer && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        )}
      </PageHeader>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
              No projects created yet. Create a project to start logging builds and bugs.
            </div>
          ) : (
            projects.map((project) => (
              <Card key={project.id} className="glass border-border/50 hover:glow-border transition-all duration-300 group">
                <CardContent className="p-6 flex flex-col justify-between h-[180px]">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <FolderKanban className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${
                        project.status === "ACTIVE"
                          ? "bg-status-fixed/10 text-status-fixed border-status-fixed/30"
                          : "bg-muted text-muted-foreground border-border"
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-base hover:underline text-foreground">
                      <Link href={`/projects/${project.id}`}>{project.name}</Link>
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 max-w-[280px]">
                      {project.description || "No description provided."}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border/30">
                    <div>
                      Bugs: <span className="font-bold text-foreground">{project._count.bugs}</span>
                    </div>
                    <div>
                      Builds: <span className="font-bold text-foreground">{project._count.builds}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="glass max-w-md border-border/50">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create New Project</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Initialize a new gaming project context.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Project Name *</label>
              <input
                type="text"
                placeholder="e.g. Dragon's Fury Online"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
              <textarea
                placeholder="Brief summary of the game, genre, target platforms..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                disabled={submitting}
                className="px-4 h-9 rounded-lg bg-secondary/50 border border-border text-xs text-foreground font-semibold hover:bg-secondary transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !name}
                className="px-5 h-9 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all text-xs flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Create Project
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
