"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 ml-[240px] transition-all duration-300">
          <Header />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
