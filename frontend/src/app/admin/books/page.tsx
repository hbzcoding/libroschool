"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/services/admin";
import { AdminBook, AdminBooksFilters } from "@/types/admin";
import { STATUS_LABELS, CONDITION_LABELS } from "@/types/book";
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

export default function AdminBooksPage() {
  const { t } = useTranslation();
  const [books, setBooks] = useState<AdminBook[]>([]);
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

    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const filters: AdminBooksFilters = {
          page,
          per_page: 15,
        };
        if (search) filters.search = search;
        if (statusFilter) filters.status = statusFilter as AdminBooksFilters["status"];

        const response = await adminService.getBooks(filters);
        if (!cancelled) {
          setBooks(response.data);
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

    fetchBooks();

    return () => {
      cancelled = true;
    };
  }, [search, statusFilter, page, t]);

  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: AdminBooksFilters = {
        page,
        per_page: 15,
      };
      if (search) filters.search = search;
      if (statusFilter) filters.status = statusFilter as AdminBooksFilters["status"];

      const response = await adminService.getBooks(filters);
      setBooks(response.data);
      setTotalPages(response.meta.last_page);
      setTotal(response.meta.total);
      setError(null);
    } catch {
      setError(t("admin.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page]);

  const handleHide = async (bookId: number) => {
    try {
      setActionLoading(bookId);
      await adminService.hideBook(bookId);
      await fetchBooks();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnhide = async (bookId: number) => {
    try {
      setActionLoading(bookId);
      await adminService.unhideBook(bookId);
      await fetchBooks();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (bookId: number) => {
    try {
      setActionLoading(bookId);
      await adminService.deleteBook(bookId);
      await fetchBooks();
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

  const formatPrice = (price: number) => {
    return `€${price.toFixed(2)}`;
  };

  const getStatusVariant = (status: string): "success" | "warning" | "danger" | "default" => {
    switch (status) {
      case "available":
        return "success";
      case "reserved":
        return "warning";
      case "sold":
        return "default";
      case "hidden":
        return "danger";
      default:
        return "default";
    }
  };

  const columns: Column<AdminBook>[] = [
    {
      key: "title",
      label: t("admin.tables.title"),
      render: (book) => (
        <div>
          <p className="text-sm font-medium text-[#f7f8f8] max-w-xs truncate">{book.title}</p>
          <p className="text-xs text-[#8a8f98]">
            by {book.seller.name} • {book.school?.name || t("admin.noSchool")}
          </p>
        </div>
      ),
    },
    {
      key: "condition",
      label: t("admin.tables.condition"),
      render: (book) => (
        <span className="text-xs text-[#d0d6e0]">
          {CONDITION_LABELS[book.condition]}
        </span>
      ),
    },
    {
      key: "price",
      label: t("admin.tables.price"),
      render: (book) => (
        <span className="text-sm font-medium text-[#f7f8f8]">
          {formatPrice(book.price)}
        </span>
      ),
    },
    {
      key: "status",
      label: t("admin.tables.status"),
      render: (book) => (
        <StatusBadge
          status={STATUS_LABELS[book.status]}
          variant={getStatusVariant(book.status)}
        />
      ),
    },
    {
      key: "created_at",
      label: t("admin.tables.createdAt"),
      render: (book) => (
        <span className="text-xs text-[#62666d]">{formatDate(book.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: t("admin.tables.actions"),
      render: (book) => (
        <div className="flex items-center gap-1">
          {book.status === "hidden" ? (
            <ConfirmDialog
              title={t("admin.actions.unhideBook")}
              description={t("admin.confirmUnhide")}
              confirmLabel={t("admin.actions.unhideBook")}
              onConfirm={() => handleUnhide(book.id)}
              trigger={
                <button
                  disabled={actionLoading === book.id}
                  className="rounded-md border border-[#23252a] bg-[#0f1011] px-2.5 py-1 text-xs text-[#d0d6e0] hover:bg-[#141516] transition-colors disabled:opacity-50"
                >
                  {t("admin.actions.unhideBook")}
                </button>
              }
            />
          ) : (
            <ConfirmDialog
              title={t("admin.actions.hideBook")}
              description={t("admin.confirmHide")}
              confirmLabel={t("admin.actions.hideBook")}
              variant="destructive"
              onConfirm={() => handleHide(book.id)}
              trigger={
                <button
                  disabled={actionLoading === book.id}
                  className="rounded-md border border-red-800/50 bg-red-900/20 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/30 transition-colors disabled:opacity-50"
                >
                  {t("admin.actions.hideBook")}
                </button>
              }
            />
          )}
          <ConfirmDialog
            title={t("admin.actions.deleteBook")}
            description={t("admin.confirmDelete")}
            confirmLabel={t("admin.actions.deleteBook")}
            variant="destructive"
            onConfirm={() => handleDelete(book.id)}
            trigger={
              <button
                disabled={actionLoading === book.id}
                className="rounded-md border border-red-800/50 bg-red-900/20 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/30 transition-colors disabled:opacity-50"
              >
                {t("admin.actions.deleteBook")}
              </button>
            }
          />
        </div>
      ),
    },
  ];

  if (isLoading && books.length === 0) {
    return <AdminLoadingState />;
  }

  if (error && books.length === 0) {
    return <AdminErrorState message={error} onRetry={fetchBooks} />;
  }

  return (
    <div>
      <PageHeader
        title={t("admin.books")}
        description={`${total} ${t("admin.totalBooks")}`}
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
            { value: "available", label: t("admin.status.available") },
            { value: "reserved", label: t("admin.status.reserved") },
            { value: "sold", label: t("admin.status.sold") },
            { value: "hidden", label: t("admin.filters.hidden") },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={books}
        meta={{
          current_page: page,
          last_page: totalPages,
          total,
          per_page: 15,
        }}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage={t("admin.empty.books")}
      />
    </div>
  );
}