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

export default function AdminReportsPage() {
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
          setError("Failed to load reports");
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
  }, [search, statusFilter, typeFilter, page]);

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
      setError("Failed to load reports");
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
      label: "Reporter",
      render: (report) => (
        <div>
          <p className="text-sm font-medium text-[#f7f8f8]">{report.reporter.name}</p>
          <p className="text-xs text-[#8a8f98]">{report.reporter.email}</p>
        </div>
      ),
    },
    {
      key: "target_type",
      label: "Target",
      render: (report) => (
        <div>
          <p className="text-sm text-[#d0d6e0]">{report.target_type}</p>
          <p className="text-xs text-[#62666d]">ID: {report.target_id}</p>
        </div>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (report) => (
        <p className="text-xs text-[#d0d6e0] max-w-xs truncate">{report.reason}</p>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (report) => (
        <StatusBadge
          status={report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          variant={getStatusVariant(report.status)}
        />
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (report) => (
        <span className="text-xs text-[#62666d]">{formatDate(report.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (report) => (
        <div className="flex items-center gap-1">
          {report.status === "open" && (
            <>
              <ConfirmDialog
                title="Resolve Report"
                description="Mark this report as resolved?"
                confirmLabel="Resolve"
                onConfirm={() => handleResolve(report.id)}
                trigger={
                  <button
                    disabled={actionLoading === report.id}
                    className="rounded-md border border-[#23252a] bg-[#0f1011] px-2.5 py-1 text-xs text-emerald-400 hover:bg-[#141516] transition-colors disabled:opacity-50"
                  >
                    Resolve
                  </button>
                }
              />
              <ConfirmDialog
                title="Dismiss Report"
                description="Dismiss this report as invalid?"
                confirmLabel="Dismiss"
                variant="destructive"
                onConfirm={() => handleDismiss(report.id)}
                trigger={
                  <button
                    disabled={actionLoading === report.id}
                    className="rounded-md border border-[#23252a] bg-[#0f1011] px-2.5 py-1 text-xs text-[#d0d6e0] hover:bg-[#141516] transition-colors disabled:opacity-50"
                  >
                    Dismiss
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
        title="Reports"
        description={`${total} total reports`}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search..."
          />
        </div>
        <FilterSelect
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          placeholder="All Status"
          options={[
            { value: "open", label: "Open" },
            { value: "reviewed", label: "Reviewed" },
            { value: "dismissed", label: "Dismissed" },
          ]}
        />
        <FilterSelect
          value={typeFilter}
          onChange={(v) => { setTypeFilter(v); setPage(1); }}
          placeholder="All Types"
          options={[
            { value: "Book", label: "Book" },
            { value: "BookRequest", label: "Book Request" },
            { value: "Note", label: "Note" },
            { value: "Classroom", label: "Classroom" },
            { value: "User", label: "User" },
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
        emptyMessage="No reports found"
      />
    </div>
  );
}