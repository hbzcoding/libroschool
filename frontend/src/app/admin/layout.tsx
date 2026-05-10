"use client";

import { useAdmin } from "@/features/admin/hooks/useAdmin";
import { AdminSidebar, AdminMobileNav } from "@/features/admin/components/AdminSidebar";
import { AdminLoadingState } from "@/features/admin/components/DataTable";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAdmin } = useAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#010102]">
        <AdminLoadingState />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Redirect happens in useAdmin
  }

  return (
    <div className="min-h-screen bg-[#010102]">
      <AdminSidebar />
      <AdminMobileNav />
      <main className="md:ml-64 pb-20 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}