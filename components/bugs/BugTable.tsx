"use client";

import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { formatDate } from "@/lib/utils";
import type { BugStatus, BugSeverity, BugPriority } from "@/types";
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface Bug {
  id: string;
  bugCode: string;
  title: string;
  project: { id: string; name: string };
  severity: BugSeverity;
  priority: BugPriority;
  status: BugStatus;
  reporter: { name: string; avatar?: string | null };
  assignedTo?: { name: string; avatar?: string | null } | null;
  createdAt: string;
}

interface BugTableProps {
  bugs: Bug[];
  onPageChange: (page: number) => void;
  page: number;
  totalPages: number;
  total: number;
}

export function BugTable({ bugs, onPageChange, page, totalPages, total }: BugTableProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl overflow-hidden border border-border/50">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">{t('bugs.table.code')}</th>
                <th className="p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">{t('bugs.table.title')}</th>
                <th className="p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">{t('bugs.table.project')}</th>
                <th className="p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">{t('bugs.table.severity')}</th>
                <th className="p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">{t('bugs.table.priority')}</th>
                <th className="p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">{t('bugs.table.status')}</th>
                <th className="p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">{t('bugs.table.assignee')}</th>
                <th className="p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">{t('bugs.table.date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bugs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No bugs found. Get playing and find some bugs!
                  </td>
                </tr>
              ) : (
                bugs.map((bug) => (
                  <tr
                    key={bug.id}
                    className="hover:bg-muted/20 transition-colors duration-150 group cursor-pointer"
                  >
                    <td className="p-4 font-bold text-primary group-hover:underline">
                      <Link href={`/bugs/${bug.id}`}>{bug.bugCode}</Link>
                    </td>
                    <td className="p-4 font-medium max-w-[240px] truncate">
                      <Link href={`/bugs/${bug.id}`} className="block">
                        {bug.title}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground truncate max-w-[120px]">{bug.project.name}</td>
                    <td className="p-4">
                      <SeverityBadge severity={bug.severity} />
                    </td>
                    <td className="p-4">
                      <PriorityBadge priority={bug.priority} />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={bug.status} />
                    </td>
                    <td className="p-4">
                      {bug.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <UserAvatar name={bug.assignedTo.name} image={bug.assignedTo.avatar} size="sm" />
                          <span className="text-xs truncate max-w-[100px]">{bug.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">{formatDate(bug.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{bugs.length}</span> of{" "}
            <span className="font-semibold text-foreground">{total}</span> bugs
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 text-xs rounded-lg bg-secondary/50 border border-border text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 text-xs rounded-lg bg-secondary/50 border border-border text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
