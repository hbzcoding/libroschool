"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/services/admin";
import { AdminReport, AdminReportsFilters } from "@/types/admin";
import {
  DataTable,
  StatusBadge,
  SearchInput,
  FilterSelect,
  PageHeader,
  AdminLoadingState,
  AdminErrorState,
} from "@/features/admin/components/DataTable";
import { ConfirmDialog } from "@/features/admin/components/ConfirmDialog";
import { Column } from "@/features/admin/components/DataTable";
import { useTranslation } from "@/hooks/useTranslation";

export default function AdminReportsPage() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const filters: AdminReportsFilters = {
          page,
          per_page: 15,
        };
        if (search) filters.search = search;
        if (statusFilter) filters.status = statusFilter as AdminReportsFilters["status"];
        if (typeFilter) filters.target_type = typeFilter as AdminReportsFilters["target_type"];

        const response = await adminService.getReports(filters);
        if (!cancelled) {
          setReports(response.data);
          setTotalPages(response.meta.last_page);
          setTotal(response.meta.total);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError(t("admin.loadError"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchReports();

    return () => {
      cancelled = true;
    };
  }, [search, statusFilter, typeFilter, page, t]);

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: AdminReportsFilters = {
        page,
        per_page: 15,
      };
      if (search) filters.search = search;
      if (statusFilter) filters.status = statusFilter as AdminReportsFilters["status"];
      if (typeFilter) filters.target_type = typeFilter as AdminReportsFilters["target_type"];

      const response = await adminService.getReports(filters);
      setReports(response.data);
      setTotalPages(response.meta.last_page);
      setTotal(response.meta.total);
      setError(null);
    } catch {
      setError(t("admin.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, typeFilter, page]);

  const handleResolve = async (reportId: number) => {
    try {
      setActionLoading(reportId);
      await adminService.resolveReport(reportId);
      await fetchReports();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (reportId: number) => {
    try {
      setActionLoading(reportId);
      await adminService.dismissReport(reportId);
      await fetchReports();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusVariant = (status: string): "success" | "warning" | "danger" | "default" => {
    switch (status) {
      case "open":
        return "danger";
      case "reviewed":
        return "warning";
      case "dismissed":
        return "default";
      default:
        return "default";
    }
  };

  const columns: Column<AdminReport>[] = [
    {
      key: "reporter",
      label: t("admin.tables.reporter"),
      render: (report) => (
        <div>
          <p className="text-sm font-medium text-[#f7f8f8]">{report.reporter.name}</p>
          <p className="text-xs text-[#8a8f98]">{report.reporter.email}</p>
        </div>
      ),
    },
    {
      key: "target_type",
      label: t("admin.tables.target"),
      render: (report) => (
        <div>
          <p className="text-sm text-[#d0d6e0]">{report.target_type}</p>
          <p className="text-xs text-[#62666d]">ID: {report.target_id}</p>
        </div>
      ),
    },
    {
      key: "reason",
      label: t("admin.tables.reason"),
      render: (report) => (
        <p className="text-xs text-[#d0d6e0] max-w-xs truncate">{report.reason}</p>
      ),
    },
    {
      key: "status",
      label: t("admin.tables.status"),
      render: (report) => (
        <StatusBadge
          status={t(`admin.reportStatus.${report.status}`)}
          variant={getStatusVariant(report.status)}
        />
      ),
    },
    {
      key: "created_at",
      label: t("admin.tables.createdAt"),
      render: (report) => (
        <span className="text-xs text-[#62666d]">{formatDate(report.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: t("admin.tables.actions"),
      render: (report) => (
        <div className="flex items-center gap-1">
          {report.status === "open" && (
            <>
              <ConfirmDialog
                title={t("admin.actions.resolveReport")}
                description={t("admin.confirmResolve")}
                confirmLabel={t("admin.actions.resolveReport")}
                onConfirm={() => handleResolve(report.id)}
                trigger={
                  <button
                    disabled={actionLoading === report.id}
                    className="rounded-md border border-[#23252a] bg-[#0f1011] px-2.5 py-1 text-xs text-emerald-400 hover:bg-[#141516] transition-colors disabled:opacity-50"
                  >
                    {t("admin.actions.resolveReport")}
                  </button>
                }
              />
              <ConfirmDialog
                title={t("admin.actions.dismissReport")}
                description={t("admin.confirmDismiss")}
                confirmLabel={t("admin.actions.dismissReport")}
                variant="destructive"
                onConfirm={() => handleDismiss(report.id)}
                trigger={
                  <button
                    disabled={actionLoading === report.id}
                    className="rounded-md border border-[#23252a] bg-[#0f1011] px-2.5 py-1 text-xs text-[#d0d6e0] hover:bg-[#141516] transition-colors disabled:opacity-50"
                  >
                    {t("admin.actions.dismissReport")}
                  </button>
                }
              />
            </>
          )}
        </div>
      ),
    },
  ];

  if (isLoading && reports.length === 0) {
    return <AdminLoadingState />;
  }

  if (error && reports.length === 0) {
    return <AdminErrorState message={error} onRetry={fetchReports} />;
  }

  return (
    <div>
      <PageHeader
        title={t("admin.reports")}
        description={`${total} ${t("admin.totalReports")}`}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder={t("admin.search")}
          />
        </div>
        <FilterSelect
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          placeholder={t("admin.filters.all")}
          options={[
            { value: "open", label: t("admin.filters.pending") },
            { value: "reviewed", label: t("admin.filters.reviewed") },
            { value: "dismissed", label: t("admin.filters.dismissed") },
          ]}
        />
        <FilterSelect
          value={typeFilter}
          onChange={(v) => { setTypeFilter(v); setPage(1); }}
          placeholder={t("admin.filters.allTypes")}
          options={[
            { value: "Book", label: t("admin.types.book") },
            { value: "BookRequest", label: t("admin.types.bookRequest") },
            { value: "Note", label: t("admin.types.note") },
            { value: "Classroom", label: t("admin.types.classroom") },
            { value: "User", label: t("admin.types.user") },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={reports}
        meta={{
          current_page: page,
          last_page: totalPages,
          total,
          per_page: 15,
        }}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage={t("admin.empty.reports")}
      />
    </div>
  );
}