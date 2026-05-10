"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/services/admin";
import { AdminBookRequest, AdminBookRequestsFilters } from "@/types/admin";
import { REQUEST_STATUS_LABELS } from "@/types/bookRequest";
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

export default function AdminRequestsPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<AdminBookRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const filters: AdminBookRequestsFilters = {
          page,
          per_page: 15,
        };
        if (search) filters.search = search;
        if (statusFilter) filters.status = statusFilter as AdminBookRequestsFilters["status"];

        const response = await adminService.getBookRequests(filters);
        if (!cancelled) {
          setRequests(response.data);
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

    fetchRequests();

    return () => {
      cancelled = true;
    };
  }, [search, statusFilter, page, t]);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: AdminBookRequestsFilters = {
        page,
        per_page: 15,
      };
      if (search) filters.search = search;
      if (statusFilter) filters.status = statusFilter as AdminBookRequestsFilters["status"];

      const response = await adminService.getBookRequests(filters);
      setRequests(response.data);
      setTotalPages(response.meta.last_page);
      setTotal(response.meta.total);
      setError(null);
    } catch {
      setError(t("admin.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page]);

  const handleHide = async (id: number) => {
    try {
      setActionLoading(id);
      await adminService.hideBookRequest(id);
      await fetchRequests();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnhide = async (id: number) => {
    try {
      setActionLoading(id);
      await adminService.unhideBookRequest(id);
      await fetchRequests();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setActionLoading(id);
      await adminService.deleteBookRequest(id);
      await fetchRequests();
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
    });
  };

  const formatPrice = (price: number | null) => {
    return price ? `€${price.toFixed(2)}` : "—";
  };

  const getStatusVariant = (status: string): "success" | "warning" | "danger" | "default" => {
    switch (status) {
      case "open":
        return "success";
      case "matched":
        return "warning";
      case "closed":
        return "default";
      case "hidden":
        return "danger";
      default:
        return "default";
    }
  };

  const columns: Column<AdminBookRequest>[] = [
    {
      key: "title",
      label: t("admin.tables.title"),
      render: (request) => (
        <div>
          <p className="text-sm font-medium text-[#f7f8f8] max-w-xs truncate">{request.title}</p>
          <p className="text-xs text-[#8a8f98]">
            by {request.buyer.name} • {request.school?.name || t("admin.noSchool")}
          </p>
        </div>
      ),
    },
    {
      key: "max_price",
      label: t("admin.tables.price"),
      render: (request) => (
        <span className="text-sm text-[#d0d6e0]">
          {formatPrice(request.max_price)}
        </span>
      ),
    },
    {
      key: "status",
      label: t("admin.tables.status"),
      render: (request) => (
        <StatusBadge
          status={REQUEST_STATUS_LABELS[request.status]}
          variant={getStatusVariant(request.status)}
        />
      ),
    },
    {
      key: "created_at",
      label: t("admin.tables.createdAt"),
      render: (request) => (
        <span className="text-xs text-[#62666d]">{formatDate(request.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: t("admin.tables.actions"),
      render: (request) => (
        <div className="flex items-center gap-1">
          {request.status === "hidden" ? (
            <ConfirmDialog
              title={t("admin.actions.unhideRequest")}
              description={t("admin.confirmUnhide")}
              confirmLabel={t("admin.actions.unhideRequest")}
              onConfirm={() => handleUnhide(request.id)}
              trigger={
                <button
                  disabled={actionLoading === request.id}
                  className="rounded-md border border-[#23252a] bg-[#0f1011] px-2.5 py-1 text-xs text-[#d0d6e0] hover:bg-[#141516] transition-colors disabled:opacity-50"
                >
                  {t("admin.actions.unhideRequest")}
                </button>
              }
            />
          ) : (
            <ConfirmDialog
              title={t("admin.actions.hideRequest")}
              description={t("admin.confirmHide")}
              confirmLabel={t("admin.actions.hideRequest")}
              variant="destructive"
              onConfirm={() => handleHide(request.id)}
              trigger={
                <button
                  disabled={actionLoading === request.id}
                  className="rounded-md border border-red-800/50 bg-red-900/20 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/30 transition-colors disabled:opacity-50"
                >
                  {t("admin.actions.hideRequest")}
                </button>
              }
            />
          )}
          <ConfirmDialog
            title={t("admin.actions.deleteRequest")}
            description={t("admin.confirmDelete")}
            confirmLabel={t("admin.actions.deleteRequest")}
            variant="destructive"
            onConfirm={() => handleDelete(request.id)}
            trigger={
              <button
                disabled={actionLoading === request.id}
                className="rounded-md border border-red-800/50 bg-red-900/20 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/30 transition-colors disabled:opacity-50"
              >
                {t("admin.actions.deleteRequest")}
              </button>
            }
          />
        </div>
      ),
    },
  ];

  if (isLoading && requests.length === 0) {
    return <AdminLoadingState />;
  }

  if (error && requests.length === 0) {
    return <AdminErrorState message={error} onRetry={fetchRequests} />;
  }

  return (
    <div>
      <PageHeader
        title={t("admin.requests")}
        description={`${total} ${t("admin.totalRequests")}`}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder={t("admin.searchTitle")}
          />
        </div>
        <FilterSelect
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          placeholder={t("admin.filters.all")}
          options={[
            { value: "open", label: t("admin.filters.pending") },
            { value: "matched", label: t("admin.status.matched") },
            { value: "closed", label: t("admin.status.closed") },
            { value: "hidden", label: t("admin.filters.hidden") },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={requests}
        meta={{
          current_page: page,
          last_page: totalPages,
          total,
          per_page: 15,
        }}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage={t("admin.empty.requests")}
      />
    </div>
  );
}