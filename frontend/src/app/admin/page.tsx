"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/admin";
import { AdminDashboardStats } from "@/types/admin";
import { useAdmin } from "@/features/admin/hooks/useAdmin";
import { AdminLoadingState, AdminErrorState } from "@/features/admin/components/DataTable";
import { useTranslation } from "@/hooks/useTranslation";

interface StatCardProps {
  label: string;
  value: number;
  subValue?: string;
}

function StatCard({ label, value, subValue }: StatCardProps) {
  return (
    <div className="rounded-lg border border-[#23252a] bg-[#0f1011] p-4">
      <p className="text-xs text-[#8a8f98] uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#f7f8f8]">{value.toLocaleString()}</p>
      {subValue && <p className="mt-1 text-xs text-[#62666d]">{subValue}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { isAdmin } = useAdmin();
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await adminService.getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(t("admin.loadError"));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin, t]);

  if (isLoading) {
    return <AdminLoadingState />;
  }

  if (error) {
    return <AdminErrorState message={error} />;
  }

  if (!stats) {
    return null;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#f7f8f8]">{t("admin.dashboard")}</h1>
        <p className="mt-1 text-sm text-[#8a8f98]">{t("admin.welcome")}</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("admin.stats.totalUsers")}
          value={stats.users_total}
          subValue={`${stats.users_banned} banned`}
        />
        <StatCard
          label={t("admin.stats.totalBooks")}
          value={stats.books_total}
          subValue={`${stats.books_hidden} hidden`}
        />
        <StatCard
          label={t("admin.stats.totalRequests")}
          value={stats.requests_total}
          subValue={`${stats.requests_hidden} hidden`}
        />
        <StatCard
          label={t("admin.stats.totalNotes")}
          value={stats.notes_total}
          subValue={`${stats.notes_hidden} hidden`}
        />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mt-4">
        <StatCard
          label={t("admin.stats.totalClassrooms")}
          value={stats.classrooms_total}
          subValue={`${stats.classrooms_locked} locked`}
        />
        <StatCard
          label={t("admin.stats.pendingReports")}
          value={stats.reports_open}
          subValue={`${stats.reports_resolved} resolved`}
        />
        <StatCard
          label={t("admin.schools")}
          value={stats.schools_total}
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[#23252a] bg-[#0f1011] p-4">
          <h2 className="text-sm font-medium text-[#d0d6e0] mb-4">{t("admin.quickActions")}</h2>
          <div className="space-y-2">
            <a
              href="/admin/reports"
              className="flex items-center justify-between rounded-lg border border-[#23252a] bg-[#141516] px-4 py-3 hover:bg-[#18191a] transition-colors"
            >
              <span className="text-sm text-[#f7f8f8]">{t("admin.actions.reviewReports")}</span>
              {stats.reports_open > 0 && (
                <span className="rounded-full bg-red-900/30 px-2 py-0.5 text-xs text-red-400">
                  {stats.reports_open}
                </span>
              )}
            </a>
            <a
              href="/admin/users"
              className="flex items-center justify-between rounded-lg border border-[#23252a] bg-[#141516] px-4 py-3 hover:bg-[#18191a] transition-colors"
            >
              <span className="text-sm text-[#f7f8f8]">{t("admin.actions.manageUsers")}</span>
              <span className="text-xs text-[#8a8f98]">
                {stats.users_total} total
              </span>
            </a>
            <a
              href="/admin/schools"
              className="flex items-center justify-between rounded-lg border border-[#23252a] bg-[#141516] px-4 py-3 hover:bg-[#18191a] transition-colors"
            >
              <span className="text-sm text-[#f7f8f8]">{t("admin.actions.manageSchools")}</span>
              <span className="text-xs text-[#8a8f98]">
                {stats.schools_total} total
              </span>
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-[#23252a] bg-[#0f1011] p-4">
          <h2 className="text-sm font-medium text-[#d0d6e0] mb-4">{t("admin.contentOverview")}</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#8a8f98]">{t("admin.booksAvailable")}</span>
              <span className="text-sm text-[#f7f8f8]">{stats.books_total - stats.books_hidden}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#8a8f98]">{t("admin.requestsOpen")}</span>
              <span className="text-sm text-[#f7f8f8]">{stats.requests_total - stats.requests_hidden}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#8a8f98]">{t("admin.notesPublic")}</span>
              <span className="text-sm text-[#f7f8f8]">{stats.notes_total - stats.notes_hidden}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#8a8f98]">{t("admin.activeClassrooms")}</span>
              <span className="text-sm text-[#f7f8f8]">{stats.classrooms_total - stats.classrooms_locked}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}