"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/services/admin";
import { AdminClassroom, AdminClassroomsFilters } from "@/types/admin";
import { CLASSROOM_STATUS_LABELS } from "@/types/classroom";
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

export default function AdminClassroomsPage() {
  const [classrooms, setClassrooms] = useState<AdminClassroom[]>([]);
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

    const fetchClassrooms = async () => {
      try {
        setIsLoading(true);
        const filters: AdminClassroomsFilters = {
          page,
          per_page: 15,
        };
        if (search) filters.search = search;
        if (statusFilter) filters.status = statusFilter as AdminClassroomsFilters["status"];

        const response = await adminService.getClassrooms(filters);
        if (!cancelled) {
          setClassrooms(response.data);
          setTotalPages(response.meta.last_page);
          setTotal(response.meta.total);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load classrooms");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchClassrooms();

    return () => {
      cancelled = true;
    };
  }, [search, statusFilter, page]);

  const fetchClassrooms = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: AdminClassroomsFilters = {
        page,
        per_page: 15,
      };
      if (search) filters.search = search;
      if (statusFilter) filters.status = statusFilter as AdminClassroomsFilters["status"];

      const response = await adminService.getClassrooms(filters);
      setClassrooms(response.data);
      setTotalPages(response.meta.last_page);
      setTotal(response.meta.total);
      setError(null);
    } catch {
      setError("Failed to load classrooms");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page]);

  const handleLock = async (classroomId: number) => {
    try {
      setActionLoading(classroomId);
      await adminService.lockClassroom(classroomId);
      await fetchClassrooms();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnlock = async (classroomId: number) => {
    try {
      setActionLoading(classroomId);
      await adminService.unlockClassroom(classroomId);
      await fetchClassrooms();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (classroomId: number) => {
    try {
      setActionLoading(classroomId);
      await adminService.deleteClassroom(classroomId);
      await fetchClassrooms();
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

  const getStatusVariant = (status: string): "success" | "warning" | "danger" | "default" => {
    switch (status) {
      case "active":
        return "success";
      case "locked":
        return "danger";
      case "archived":
        return "default";
      default:
        return "default";
    }
  };

  const columns: Column<AdminClassroom>[] = [
    {
      key: "name",
      label: "Classroom",
      render: (classroom) => (
        <div>
          <p className="text-sm font-medium text-[#f7f8f8] max-w-xs truncate">{classroom.name}</p>
          <p className="text-xs text-[#8a8f98]">
            {classroom.school?.name} • Grade {classroom.grade}{classroom.section}
          </p>
        </div>
      ),
    },
    {
      key: "academic_year",
      label: "Year",
      render: (classroom) => (
        <span className="text-xs text-[#d0d6e0]">{classroom.academic_year}</span>
      ),
    },
    {
      key: "members_count",
      label: "Members",
      render: (classroom) => (
        <span className="text-sm text-[#f7f8f8]">{classroom.members_count}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (classroom) => (
        <StatusBadge
          status={CLASSROOM_STATUS_LABELS[classroom.status]}
          variant={getStatusVariant(classroom.status)}
        />
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (classroom) => (
        <span className="text-xs text-[#62666d]">{formatDate(classroom.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (classroom) => (
        <div className="flex items-center gap-1">
          {classroom.status === "locked" ? (
            <ConfirmDialog
              title="Unlock Classroom"
              description="Unlock this classroom? Members will be able to interact again."
              confirmLabel="Unlock"
              onConfirm={() => handleUnlock(classroom.id)}
              trigger={
                <button
                  disabled={actionLoading === classroom.id}
                  className="rounded-md border border-[#23252a] bg-[#0f1011] px-2.5 py-1 text-xs text-[#d0d6e0] hover:bg-[#141516] transition-colors disabled:opacity-50"
                >
                  Unlock
                </button>
              }
            />
          ) : (
            <ConfirmDialog
              title="Lock Classroom"
              description="Lock this classroom? Members will not be able to interact."
              confirmLabel="Lock"
              variant="destructive"
              onConfirm={() => handleLock(classroom.id)}
              trigger={
                <button
                  disabled={actionLoading === classroom.id}
                  className="rounded-md border border-red-800/50 bg-red-900/20 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/30 transition-colors disabled:opacity-50"
                >
                  Lock
                </button>
              }
            />
          )}
          <ConfirmDialog
            title="Delete Classroom"
            description="Permanently delete this classroom? This cannot be undone."
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={() => handleDelete(classroom.id)}
            trigger={
              <button
                disabled={actionLoading === classroom.id}
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

  if (isLoading && classrooms.length === 0) {
    return <AdminLoadingState />;
  }

  if (error && classrooms.length === 0) {
    return <AdminErrorState message={error} onRetry={fetchClassrooms} />;
  }

  return (
    <div>
      <PageHeader
        title="Classrooms"
        description={`${total} total classrooms`}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search by name..."
          />
        </div>
        <FilterSelect
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          placeholder="All Status"
          options={[
            { value: "active", label: "Active" },
            { value: "locked", label: "Locked" },
            { value: "archived", label: "Archived" },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={classrooms}
        meta={{
          current_page: page,
          last_page: totalPages,
          total,
          per_page: 15,
        }}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="No classrooms found"
      />
    </div>
  );
}