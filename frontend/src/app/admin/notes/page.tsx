"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/services/admin";
import { AdminNote, AdminNotesFilters } from "@/types/admin";
import { VISIBILITY_LABELS, MODE_LABELS } from "@/types/note";
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

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        const filters: AdminNotesFilters = {
          page,
          per_page: 15,
        };
        if (search) filters.search = search;
        if (visibilityFilter) filters.visibility = visibilityFilter as AdminNotesFilters["visibility"];

        const response = await adminService.getNotes(filters);
        if (!cancelled) {
          setNotes(response.data);
          setTotalPages(response.meta.last_page);
          setTotal(response.meta.total);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load notes");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchNotes();

    return () => {
      cancelled = true;
    };
  }, [search, visibilityFilter, page]);

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: AdminNotesFilters = {
        page,
        per_page: 15,
      };
      if (search) filters.search = search;
      if (visibilityFilter) filters.visibility = visibilityFilter as AdminNotesFilters["visibility"];

      const response = await adminService.getNotes(filters);
      setNotes(response.data);
      setTotalPages(response.meta.last_page);
      setTotal(response.meta.total);
      setError(null);
    } catch {
      setError("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  }, [search, visibilityFilter, page]);

  const handleHide = async (noteId: number) => {
    try {
      setActionLoading(noteId);
      await adminService.hideNote(noteId);
      await fetchNotes();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnhide = async (noteId: number) => {
    try {
      setActionLoading(noteId);
      await adminService.unhideNote(noteId);
      await fetchNotes();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (noteId: number) => {
    try {
      setActionLoading(noteId);
      await adminService.deleteNote(noteId);
      await fetchNotes();
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

  const getVisibilityVariant = (visibility: string): "success" | "warning" | "danger" | "default" => {
    switch (visibility) {
      case "public":
        return "success";
      case "classroom":
        return "default";
      case "specific_users":
        return "warning";
      case "private":
        return "default";
      default:
        return "default";
    }
  };

  const columns: Column<AdminNote>[] = [
    {
      key: "title",
      label: "Title",
      render: (note) => (
        <div>
          <p className="text-sm font-medium text-[#f7f8f8] max-w-xs truncate">{note.title}</p>
          <p className="text-xs text-[#8a8f98]">
            by {note.author.name}
          </p>
        </div>
      ),
    },
    {
      key: "mode",
      label: "Type",
      render: (note) => (
        <StatusBadge status={MODE_LABELS[note.mode]} variant="default" />
      ),
    },
    {
      key: "visibility",
      label: "Visibility",
      render: (note) => (
        <StatusBadge
          status={VISIBILITY_LABELS[note.visibility]}
          variant={getVisibilityVariant(note.visibility)}
        />
      ),
    },
    {
      key: "subject",
      label: "Subject",
      render: (note) => (
        <span className="text-xs text-[#d0d6e0]">{note.subject || "—"}</span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (note) => (
        <span className="text-xs text-[#62666d]">{formatDate(note.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (note) => (
        <div className="flex items-center gap-1">
          {note.is_hidden ? (
            <ConfirmDialog
              title="Unhide Note"
              description="Make this note visible again?"
              confirmLabel="Unhide"
              onConfirm={() => handleUnhide(note.id)}
              trigger={
                <button
                  disabled={actionLoading === note.id}
                  className="rounded-md border border-[#23252a] bg-[#0f1011] px-2.5 py-1 text-xs text-[#d0d6e0] hover:bg-[#141516] transition-colors disabled:opacity-50"
                >
                  Unhide
                </button>
              }
            />
          ) : (
            <ConfirmDialog
              title="Hide Note"
              description="Hide this note from public view?"
              confirmLabel="Hide"
              variant="destructive"
              onConfirm={() => handleHide(note.id)}
              trigger={
                <button
                  disabled={actionLoading === note.id}
                  className="rounded-md border border-red-800/50 bg-red-900/20 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/30 transition-colors disabled:opacity-50"
                >
                  Hide
                </button>
              }
            />
          )}
          <ConfirmDialog
            title="Delete Note"
            description="Permanently delete this note? This cannot be undone."
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={() => handleDelete(note.id)}
            trigger={
              <button
                disabled={actionLoading === note.id}
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

  if (isLoading && notes.length === 0) {
    return <AdminLoadingState />;
  }

  if (error && notes.length === 0) {
    return <AdminErrorState message={error} onRetry={fetchNotes} />;
  }

  return (
    <div>
      <PageHeader
        title="Notes"
        description={`${total} total notes`}
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
          value={visibilityFilter}
          onChange={(v) => { setVisibilityFilter(v); setPage(1); }}
          placeholder="All Visibility"
          options={[
            { value: "public", label: "Public" },
            { value: "classroom", label: "Classroom" },
            { value: "specific_users", label: "Specific Users" },
            { value: "private", label: "Private" },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={notes}
        meta={{
          current_page: page,
          last_page: totalPages,
          total,
          per_page: 15,
        }}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="No notes found"
      />
    </div>
  );
}