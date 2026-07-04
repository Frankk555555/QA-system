"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBugSchema, type CreateBugInput, BugSeverity, BugPriority } from "@/types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
}

interface Build {
  id: string;
  version: string;
  platform: string;
}

interface User {
  id: string;
  name: string;
}

interface BugFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function BugForm({ onSuccess, onCancel }: BugFormProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [developers, setDevelopers] = useState<User[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"core" | "env" | "session">("core");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateBugInput>({
    resolver: zodResolver(createBugSchema),
    defaultValues: {
      severity: BugSeverity.MEDIUM,
      priority: BugPriority.MEDIUM,
      environmentInfo: {
        fps: 60,
      },
    },
  });

  const selectedProjectId = watch("projectId");

  // Fetch metadata on mount
  useEffect(() => {
    async function fetchMetadata() {
      try {
        const [projRes, devRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/users/developers"),
        ]);
        const projJson = await projRes.json();
        const devJson = await devRes.json();

        if (projJson.success) setProjects(projJson.data);
        if (devJson.success) setDevelopers(devJson.data);
      } catch (err) {
        console.error("Failed to load form metadata", err);
        toast.error("Failed to load projects or developers metadata");
      } finally {
        setLoadingMetadata(false);
      }
    }
    fetchMetadata();
  }, []);

  // Fetch builds when selected project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setBuilds([]);
      return;
    }
    async function fetchBuilds() {
      try {
        const res = await fetch(`/api/projects/${selectedProjectId}`);
        const json = await res.json();
        if (json.success && json.data?.builds) {
          setBuilds(json.data.builds);
        }
      } catch (err) {
        console.error("Failed to load builds", err);
      }
    }
    fetchBuilds();
  }, [selectedProjectId]);

  const onSubmit = async (data: CreateBugInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/bugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Bug reported successfully!");
        onSuccess();
      } else {
        toast.error(json.error || "Failed to submit bug report");
      }
    } catch (err) {
      console.error("Error submitting bug:", err);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMetadata) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Tab Selectors */}
      <div className="flex border-b border-border">
        {(["core", "env", "session"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-[2px] transition-all capitalize ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "core" ? "Core Bug Details" : tab === "env" ? "Environment Info" : "Game Session Details"}
          </button>
        ))}
      </div>

      {/* Core Bug Details Tab */}
      {activeTab === "core" && (
        <div className="space-y-4 animate-[fade-in_0.2s_ease-out]">
          <div className="grid grid-cols-2 gap-4">
            {/* Project Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Project *</label>
              <select
                {...register("projectId")}
                className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.projectId && <p className="text-xs text-destructive">{errors.projectId.message}</p>}
            </div>

            {/* Build Version Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Build Version</label>
              <select
                {...register("buildId")}
                disabled={!selectedProjectId}
                className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50"
              >
                <option value="">Select Build</option>
                {builds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.version} ({b.platform})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Bug Title *</label>
            <input
              type="text"
              placeholder="e.g. Player falls through terrain when collision fails"
              {...register("title")}
              className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Bug Description *</label>
            <textarea
              placeholder="Provide a detailed description of the bug..."
              rows={4}
              {...register("description")}
              className="w-full p-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all scrollbar-thin resize-none"
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          {/* Steps to Reproduce */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Steps to Reproduce</label>
            <textarea
              placeholder="1. Launch match&#10;2. Drive Buggy vehicle into rocks&#10;3. Observe crash"
              rows={3}
              {...register("stepsToReproduce")}
              className="w-full p-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all scrollbar-thin resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Expected Result */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Expected Result</label>
              <textarea
                placeholder="What should have happened?"
                rows={2}
                {...register("expectedResult")}
                className="w-full p-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Actual Result */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Actual Result</label>
              <textarea
                placeholder="What actually happened?"
                rows={2}
                {...register("actualResult")}
                className="w-full p-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Severity */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Severity *</label>
              <select
                {...register("severity")}
                className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              >
                {Object.values(BugSeverity).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Priority *</label>
              <select
                {...register("priority")}
                className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              >
                {Object.values(BugPriority).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Assign Developer</label>
              <select
                {...register("assignedToId")}
                className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              >
                <option value="">Unassigned</option>
                {developers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Environment Info Tab */}
      {activeTab === "env" && (
        <div className="space-y-4 animate-[fade-in_0.2s_ease-out]">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">OS</label>
              <input
                type="text"
                placeholder="e.g. Windows 11 Pro / iOS 17"
                {...register("environmentInfo.os")}
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">CPU</label>
              <input
                type="text"
                placeholder="e.g. Intel Core i9-13900K"
                {...register("environmentInfo.cpu")}
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">GPU</label>
              <input
                type="text"
                placeholder="e.g. NVIDIA RTX 4080"
                {...register("environmentInfo.gpu")}
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">RAM</label>
              <input
                type="text"
                placeholder="e.g. 32GB DDR5"
                {...register("environmentInfo.ram")}
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Screen Resolution</label>
              <input
                type="text"
                placeholder="e.g. 2560x1440"
                {...register("environmentInfo.resolution")}
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Game Language</label>
              <input
                type="text"
                placeholder="e.g. English"
                {...register("environmentInfo.gameLanguage")}
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">FPS</label>
              <input
                type="number"
                {...register("environmentInfo.fps", { valueAsNumber: true })}
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Game Session Tab */}
      {activeTab === "session" && (
        <div className="space-y-4 animate-[fade-in_0.2s_ease-out]">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Map / Level</label>
              <input
                type="text"
                placeholder="e.g. Northern Highlands"
                {...register("gameSession.map")}
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Mission / Quest</label>
              <input
                type="text"
                placeholder="e.g. Dragon Slayer Phase 2"
                {...register("gameSession.mission")}
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Character / Hero Class</label>
              <input
                type="text"
                placeholder="e.g. Warrior level 40"
                {...register("gameSession.character")}
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Active Weapon / Item</label>
              <input
                type="text"
                placeholder="e.g. Dragon slayer sword"
                {...register("gameSession.weapon")}
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Game Server ID</label>
              <input
                type="text"
                placeholder="e.g. Asia-Pacific-01"
                {...register("gameSession.server")}
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Room / Session ID</label>
              <input
                type="text"
                placeholder="e.g. ROOM-4820"
                {...register("gameSession.roomId")}
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Actions buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 h-10 rounded-lg bg-secondary/50 border border-border text-sm text-foreground font-semibold hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 h-10 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Bug Report"
          )}
        </button>
      </div>
    </form>
  );
}
