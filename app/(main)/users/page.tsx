"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { UserAvatar } from "@/components/common/UserAvatar";
import { formatDate } from "@/lib/utils";
import { Plus, Trash2, Loader2, UserPlus, Shield } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserRole, UserRoleLabels } from "@/types";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  createdAt: string;
  _count: {
    reportedBugs: number;
    assignedBugs: number;
  };
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // User form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("VIEWER");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch user list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("User added successfully!");
        setIsCreateOpen(false);
        setName("");
        setEmail("");
        setPassword("");
        setRole("VIEWER");
        fetchUsers();
      } else {
        toast.error(json.error || "Failed to add user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("User deleted successfully");
        fetchUsers();
      } else {
        toast.error(json.error || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting user");
    }
  };

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <PageHeader
        title="Team Directory"
        description="Manage QA Testers, Game Developers, Producers, and Admins roles and directory access permissions."
      >
        {isAdmin && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Team Member
          </button>
        )}
      </PageHeader>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden border border-border/50">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Member</th>
                  <th className="p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Email Address</th>
                  <th className="p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">System Role</th>
                  <th className="p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Bugs Assigned</th>
                  <th className="p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Bugs Reported</th>
                  <th className="p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Joined Date</th>
                  {isAdmin && (
                    <th className="p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/10 transition-colors duration-150">
                    <td className="p-4 flex items-center gap-3">
                      <UserAvatar name={u.name} image={u.avatar} size="sm" />
                      <span className="font-semibold text-foreground">{u.name}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">{u.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        u.role === "ADMIN"
                          ? "bg-critical/15 text-critical border-critical/30"
                          : u.role === "PRODUCER"
                          ? "bg-major/15 text-major border-major/30"
                          : u.role === "DEVELOPER"
                          ? "bg-status-assigned/15 text-status-assigned border-status-assigned/30"
                          : u.role === "QA_TESTER"
                          ? "bg-primary/15 text-primary border-primary/30"
                          : "bg-muted text-muted-foreground border-border"
                      }`}>
                        <Shield className="w-3 h-3" />
                        {UserRoleLabels[u.role] || u.role}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-center md:text-left">{u._count?.assignedBugs ?? 0}</td>
                    <td className="p-4 font-semibold text-center md:text-left">{u._count?.reportedBugs ?? 0}</td>
                    <td className="p-4 text-muted-foreground text-xs">{formatDate(u.createdAt)}</td>
                    {isAdmin && (
                      <td className="p-4 text-right">
                        {u.id !== session?.user?.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/15 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Team Member Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="glass max-w-md border-border/50">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Team Member</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Configure name, email, credentials password, and project role permissions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Alex Rodriguez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Email Address *</label>
              <input
                type="email"
                placeholder="e.g. alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Password *</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-10 px-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">System Access Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                required
                className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              >
                {Object.keys(UserRole).map((r) => (
                  <option key={r} value={r}>
                    {UserRoleLabels[r as UserRole] || r}
                  </option>
                ))}
              </select>
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
                disabled={submitting || !name || !email || !password}
                className="px-5 h-9 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all text-xs flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Add Member
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
