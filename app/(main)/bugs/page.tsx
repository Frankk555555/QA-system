"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { BugTable } from "@/components/bugs/BugTable";
import { BugTableToolbar } from "@/components/bugs/BugTableToolbar";
import { BugForm } from "@/components/bugs/BugForm";
import { useDebounce } from "@/hooks/use-debounce";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function BugsPage() {
  const { t } = useLanguage();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [priority, setPriority] = useState("");
  const [projectId, setProjectId] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  const [isReportOpen, setIsReportOpen] = useState(false);

  const fetchBugs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "10",
      });

      if (debouncedSearch) params.append("search", debouncedSearch);
      if (status) params.append("status", status);
      if (severity) params.append("severity", severity);
      if (priority) params.append("priority", priority);
      if (projectId) params.append("projectId", projectId);

      const res = await fetch(`/api/bugs?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setBugs(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }
    } catch (err) {
      console.error("Error fetching bugs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, severity, priority, projectId]);

  // Refetch when page or filters change
  useEffect(() => {
    fetchBugs();
  }, [fetchBugs]);

  const handleReset = () => {
    setSearch("");
    setStatus("");
    setSeverity("");
    setPriority("");
    setProjectId("");
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <PageHeader
        title={t('bugs.title')}
        description={t('bugs.description')}
      >
        <button
          onClick={() => setIsReportOpen(true)}
          className="flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          {t('bugs.reportBug')}
        </button>
      </PageHeader>

      <BugTableToolbar
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        onSeverityChange={(val) => {
          setSeverity(val);
          setPage(1);
        }}
        onPriorityChange={(val) => {
          setPriority(val);
          setPage(1);
        }}
        onProjectChange={(val) => {
          setProjectId(val);
          setPage(1);
        }}
        onReset={handleReset}
      />

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <BugTable
          bugs={bugs}
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {/* Report Bug Dialog */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="glass max-w-3xl max-h-[90vh] overflow-y-auto border-border/50 scrollbar-thin">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Report New Bug</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Fill in detailed gameplay context, crash steps, environment config, and session state.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <BugForm
              onSuccess={() => {
                setIsReportOpen(false);
                fetchBugs();
              }}
              onCancel={() => setIsReportOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
