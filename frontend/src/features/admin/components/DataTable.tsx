"use client";

import { PaginationMeta } from "@/types/api";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  mobileLabel?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  renderMobileCard?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-[#0f1011] rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

export function DataTable<T extends { id: number }>({
  columns,
  data,
  meta,
  onPageChange,
  renderMobileCard,
  emptyMessage,
  isLoading = false,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const fallbackEmptyMessage = emptyMessage || t("admin.noDataFound");
  if (isLoading) {
    return <TableSkeleton />;
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-[#8a8f98]">{fallbackEmptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-3">
        {renderMobileCard
          ? data.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-[#23252a] bg-[#0f1011] p-4"
              >
                {renderMobileCard(item)}
              </div>
            ))
          : data.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-[#23252a] bg-[#0f1011] p-4 space-y-2"
              >
                {columns.map((col) => (
                  <div key={col.key} className="flex items-start justify-between gap-2">
                    <span className="text-xs text-[#8a8f98] shrink-0">
                      {col.mobileLabel || col.label}
                    </span>
                    <span className="text-sm text-[#f7f8f8] text-right">
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[col.key] ?? "")}
                    </span>
                  </div>
                ))}
              </div>
            ))}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#23252a]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#8a8f98]"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#23252a]">
            {data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-[#0f1011] transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-[#d0d6e0] whitespace-nowrap">
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-[#8a8f98]">
            {t("admin.pagination.page")} {meta.current_page} {t("admin.pagination.of")} {meta.last_page} ({meta.total} {t("admin.pagination.total")})
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(meta.current_page - 1)}
              disabled={meta.current_page <= 1}
              className="rounded-md border border-[#23252a] bg-[#0f1011] px-3 py-1.5 text-xs text-[#8a8f98] hover:bg-[#141516] hover:text-[#f7f8f8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t("admin.pagination.previous")}
            </button>
            {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => {
              let page: number;
              if (meta.last_page <= 5) {
                page = i + 1;
              } else if (meta.current_page <= 3) {
                page = i + 1;
              } else if (meta.current_page >= meta.last_page - 2) {
                page = meta.last_page - 4 + i;
              } else {
                page = meta.current_page - 2 + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs transition-colors",
                    page === meta.current_page
                      ? "bg-[#5e6ad2] text-white"
                      : "border border-[#23252a] bg-[#0f1011] text-[#8a8f98] hover:bg-[#141516] hover:text-[#f7f8f8]"
                  )}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange?.(meta.current_page + 1)}
              disabled={meta.current_page >= meta.last_page}
              className="rounded-md border border-[#23252a] bg-[#0f1011] px-3 py-1.5 text-xs text-[#8a8f98] hover:bg-[#141516] hover:text-[#f7f8f8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t("admin.pagination.next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Status badge component
export function StatusBadge({
  status,
  variant = "default",
}: {
  status: string;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const colorMap = {
    default: "bg-[#141516] text-[#d0d6e0] border border-[#23252a]",
    success: "bg-emerald-900/30 text-emerald-400 border border-emerald-800/50",
    warning: "bg-amber-900/30 text-amber-400 border border-amber-800/50",
    danger: "bg-red-900/30 text-red-400 border border-red-800/50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorMap[variant]
      )}
    >
      {status}
    </span>
  );
}

// Search input component
export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const { t } = useTranslation();
  const fallbackPlaceholder = placeholder || t("admin.search");
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={fallbackPlaceholder}
      className="w-full rounded-lg border border-[#23252a] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] placeholder:text-[#62666d] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/50 focus:border-[#5e6ad2] transition-colors"
    />
  );
}

// Filter select component
export function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
}) {
  const { t } = useTranslation();
  const fallbackPlaceholder = placeholder || t("admin.filters.all");
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="rounded-lg border border-[#23252a] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/50 focus:border-[#5e6ad2] transition-colors"
    >
      <option value="">{fallbackPlaceholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// Page header
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#f7f8f8]">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-[#8a8f98]">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

// Loading state
export function AdminLoadingState() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#23252a] border-t-[#5e6ad2]" />
        <p className="text-sm text-[#8a8f98]">{t("admin.loading")}</p>
      </div>
    </div>
  );
}

// Error state
export function AdminErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-red-400">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-lg bg-[#0f1011] border border-[#23252a] px-4 py-2 text-sm text-[#d0d6e0] hover:bg-[#141516] hover:text-[#f7f8f8] transition-colors"
          >
            {t("admin.retry")}
          </button>
        )}
      </div>
    </div>
  );
}