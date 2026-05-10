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

export default function AdminBooksPage() {
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
          setError("Failed to load books");
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
  }, [search, statusFilter, page]);

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
      setError("Failed to load books");
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
      label: "Title",
      render: (book) => (
        <div>
          <p className="text-sm font-medium text-[#f7f8f8] max-w-xs truncate">{book.title}</p>
          <p className="text-xs text-[#8a8f98]">
            by {book.seller.name} • {book.school?.name || "No school"}
          </p>
        </div>
      ),
    },
    {
      key: "condition",
      label: "Condition",
      render: (book) => (
        <span className="text-xs text-[#d0d6e0]">
          {CONDITION_LABELS[book.condition]}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (book) => (
        <span className="text-sm font-medium text-[#f7f8f8]">
          {formatPrice(book.price)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (book) => (
        <StatusBadge
          status={STATUS_LABELS[book.status]}
          variant={getStatusVariant(book.status)}
        />
      ),
    },
    {
      key: "created_at",
      label: "Listed",
      render: (book) => (
        <span className="text-xs text-[#62666d]">{formatDate(book.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (book) => (
        <div className="flex items-center gap-1">
          {book.status === "hidden" ? (
            <ConfirmDialog
              title="Unhide Book"
              description="Make this book visible again?"
              confirmLabel="Unhide"
              onConfirm={() => handleUnhide(book.id)}
              trigger={
                <button
                  disabled={actionLoading === book.id}
                  className="rounded-md border border-[#23252a] bg-[#0f1011] px-2.5 py-1 text-xs text-[#d0d6e0] hover:bg-[#141516] transition-colors disabled:opacity-50"
                >
                  Unhide
                </button>
              }
            />
          ) : (
            <ConfirmDialog
              title="Hide Book"
              description="Hide this book from public view?"
              confirmLabel="Hide"
              variant="destructive"
              onConfirm={() => handleHide(book.id)}
              trigger={
                <button
                  disabled={actionLoading === book.id}
                  className="rounded-md border border-red-800/50 bg-red-900/20 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/30 transition-colors disabled:opacity-50"
                >
                  Hide
                </button>
              }
            />
          )}
          <ConfirmDialog
            title="Delete Book"
            description="Permanently delete this book? This cannot be undone."
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={() => handleDelete(book.id)}
            trigger={
              <button
                disabled={actionLoading === book.id}
                className="rounded-md border border-red-800/50 bg-red-900/20 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/30 transition-colors disabled:opacity-50"
              >
                Delete
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
        title="Books"
        description={`${total} total books listed`}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search by title..."
          />
        </div>
        <FilterSelect
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          placeholder="All Status"
          options={[
            { value: "available", label: "Available" },
            { value: "reserved", label: "Reserved" },
            { value: "sold", label: "Sold" },
            { value: "hidden", label: "Hidden" },
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
        emptyMessage="No books found"
      />
    </div>
  );
}