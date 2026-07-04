"use client";

import { useSession, signOut } from "next-auth/react";
import {
  Bell,
  Search,
  LogOut,
  User,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { UserRoleLabels } from "@/types";
import { UserRole } from "@prisma/client";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export function Header() {
  const { data: session } = useSession();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('header.searchPlaceholder')}
            className="w-full h-9 pl-10 pr-4 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all border border-transparent hover:border-border"
        >
          {language}
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive animate-pulse" />
        </button>

        {/* User menu */}
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground">
              {UserRoleLabels[(session?.user as { role?: UserRole })?.role ?? "VIEWER"]}
            </p>
          </div>
          <div className="relative group">
            <button className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
              {session?.user?.name ? getInitials(session.user.name) : <User className="w-4 h-4" />}
            </button>
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-48 glass rounded-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('header.signOut')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
