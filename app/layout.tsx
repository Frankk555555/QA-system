import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Game QA Management System",
  description:
    "Professional bug tracking and quality assurance management system designed for game development teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${geist.variable} font-sans`}>
        <LanguageProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "hsl(222 47% 8%)",
                border: "1px solid hsl(217 33% 17%)",
                color: "hsl(210 40% 98%)",
              },
            }}
          />
        </LanguageProvider>
      </body>
    </html>
  );
}
