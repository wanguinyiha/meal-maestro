"use client";

import React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./AuthProvider";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class">
      <AuthProvider>
        <Toaster richColors position="bottom-right" />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
