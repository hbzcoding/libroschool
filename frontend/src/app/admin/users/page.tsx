"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/services/admin";
import { AdminUser, AdminUsersFilters } from "@/types/admin";
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

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const filters: AdminUsersFilters = {
          page,
          per_page: 15,
        };
        if (search) filters.search = search;
        if (roleFilter) filters.role = roleFilter as "student" | "admin";

        const response = await adminService.getUsers(filters);
        if (!cancelled) {
          setUsers(response.data);
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

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [search, roleFilter, page, t]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: AdminUsersFilters = {
        page,
        per_page: 15,
      };
      if (search) filters.search = search;
      if (roleFilter) filters.role = roleFilter as "student" | "admin";

      const response = await adminService.getUsers(filters);
      setUsers(response.data);
      setTotalPages(response.meta.last_page);
      setTotal(response.meta.total);
      setError(null);
    } catch {
      setError(t("admin.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, page]);

  const handleBan = async (userId: number) => {
    try {
      setActionLoading(userId);
      await adminService.banUser(userId);
      await fetchUsers();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnban = async (userId: number) => {
    try {
      setActionLoading(userId);
      await adminService.unbanUser(userId);
      await fetchUsers();
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

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      label: t("admin.tables.name"),
      render: (user) => (
        <div>
          <p className="text-sm font-medium text-[#f7f8f8]">{user.name}</p>
          <p className="text-xs text-[#8a8f98]">{user.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      label: t("admin.tables.role"),
      render: (user) => (
        <StatusBadge
          status={user.role}
          variant={user.role === "admin" ? "warning" : "default"}
        />
      ),
    },
    {
      key: "school_id",
      label: t("admin.tables.school"),
      render: (user) => (
        <span className="text-sm text-[#8a8f98]">
          {user.school_id ? `#${user.school_id}` : "—"}
        </span>
      ),
    },
    {
      key: "banned_at",
      label: t("admin.tables.status"),
      render: (user) => (
        user.banned_at ? (
          <StatusBadge status={t("admin.filters.suspended")} variant="danger" />
        ) : (
          <StatusBadge status={t("admin.filters.active")} variant="success" />
        )
      ),
    },
    {
      key: "created_at",
      label: t("admin.tables.createdAt"),
      render: (user) => (
        <span className="text-xs text-[#62666d]">{formatDate(user.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: t("admin.tables.actions"),
      render: (user) => (
        <div className="flex items-center gap-1">
          {user.role !== "admin" && (
            user.banned_at ? (
              <ConfirmDialog
                title={t("admin.actions.activateUser")}
                description={`Unban ${user.name}? They will regain access to the platform.`}
                confirmLabel={t("admin.actions.activateUser")}
                onConfirm={() => handleUnban(user.id)}
                trigger={
                  <button
                    disabled={actionLoading === user.id}
                    className="rounded-md border border-[#23252a] bg-[#0f1011] px-2.5 py-1 text-xs text-[#d0d6e0] hover:bg-[#141516] transition-colors disabled:opacity-50"
                  >
                    {t("admin.actions.activateUser")}
                  </button>
                }
              />
            ) : (
              <ConfirmDialog
                title={t("admin.actions.suspendUser")}
                description={`Ban ${user.name}? They will lose access to the platform.`}
                confirmLabel={t("admin.actions.suspendUser")}
                variant="destructive"
                onConfirm={() => handleBan(user.id)}
                trigger={
                  <button
                    disabled={actionLoading === user.id}
                    className="rounded-md border border-red-800/50 bg-red-900/20 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/30 transition-colors disabled:opacity-50"
                  >
                    {t("admin.actions.suspendUser")}
                  </button>
                }
              />
            )
          )}
        </div>
      ),
    },
  ];

  if (isLoading && users.length === 0) {
    return <AdminLoadingState />;
  }

  if (error && users.length === 0) {
    return <AdminErrorState message={error} onRetry={fetchUsers} />;
  }

  return (
    <div>
      <PageHeader
        title={t("admin.users")}
        description={`${total} ${t("admin.totalUsers")}`}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder={t("admin.searchNameOrEmail")}
          />
        </div>
        <FilterSelect
          value={roleFilter}
          onChange={(v) => { setRoleFilter(v); setPage(1); }}
          placeholder={t("admin.filters.all")}
          options={[
            { value: "student", label: t("admin.roles.student") },
            { value: "admin", label: t("admin.roles.admin") },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={users}
        meta={{
          current_page: page,
          last_page: totalPages,
          total,
          per_page: 15,
        }}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage={t("admin.empty.users")}
      />
    </div>
  );
}