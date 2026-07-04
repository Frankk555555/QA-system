"use client";

import { useEffect, useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { BugStatus, BugSeverity, BugPriority } from "@/types";

interface Project {
  id: string;
  name: string;
}

interface BugTableToolbarProps {
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onSeverityChange: (severity: string) => void;
  onPriorityChange: (priority: string) => void;
  onProjectChange: (projectId: string) => void;
  onReset: () => void;
}

export function BugTableToolbar({
  onSearchChange,
  onStatusChange,
  onSeverityChange,
  onPriorityChange,
  onProjectChange,
  onReset,
}: BugTableToolbarProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchVal, setSearchVal] = useState("");
  const [statusVal, setStatusVal] = useState("");
  const [severityVal, setSeverityVal] = useState("");
  const [priorityVal, setPriorityVal] = useState("");
  const [projectVal, setProjectVal] = useState("");

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        const json = await res.json();
        if (json.success) {
          setProjects(json.data);
        }
      } catch (err) {
        console.error("Error fetching projects for filter:", err);
      }
    }
    fetchProjects();
  }, []);

  const handleReset = () => {
    setSearchVal("");
    setStatusVal("");
    setSeverityVal("");
    setPriorityVal("");
    setProjectVal("");
    onReset();
  };

  const hasFilters = searchVal || statusVal || severityVal || priorityVal || projectVal;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between p-4 glass rounded-xl border border-border/50">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter by title or code..."
          value={searchVal}
          onChange={(e) => {
            setSearchVal(e.target.value);
            onSearchChange(e.target.value);
          }}
          className="w-full h-9 pl-10 pr-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Project Filter */}
        <select
          value={projectVal}
          onChange={(e) => {
            setProjectVal(e.target.value);
            onProjectChange(e.target.value);
          }}
          className="h-9 px-3 rounded-lg bg-secondary/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusVal}
          onChange={(e) => {
            setStatusVal(e.target.value);
            onStatusChange(e.target.value);
          }}
          className="h-9 px-3 rounded-lg bg-secondary/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        >
          <option value="">All Statuses</option>
          {Object.values(BugStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Severity Filter */}
        <select
          value={severityVal}
          onChange={(e) => {
            setSeverityVal(e.target.value);
            onSeverityChange(e.target.value);
          }}
          className="h-9 px-3 rounded-lg bg-secondary/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        >
          <option value="">All Severities</option>
          {Object.values(BugSeverity).map((sev) => (
            <option key={sev} value={sev}>
              {sev}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={priorityVal}
          onChange={(e) => {
            setPriorityVal(e.target.value);
            onPriorityChange(e.target.value);
          }}
          className="h-9 px-3 rounded-lg bg-secondary/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        >
          <option value="">All Priorities</option>
          {Object.values(BugPriority).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {/* Reset Filters button */}
        {hasFilters && (
          <button
            onClick={handleReset}
            className="h-9 px-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive hover:bg-destructive/20 flex items-center gap-1.5 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
