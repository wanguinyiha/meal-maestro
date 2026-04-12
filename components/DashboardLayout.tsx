"use client";

import { Sidebar } from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <div className="w-64 border-r bg-card">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}