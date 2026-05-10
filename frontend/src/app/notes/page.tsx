"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/Layouts";
import { PageHeader, EmptyState, LoadingState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { NoteFilters, NoteCard } from "@/features/notes";
import { notesService } from "@/services/notes";
import { NotesFilters, Note } from "@/types/note";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Loader2 } from "lucide-react";

export default function NotesPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NotesFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    const fetchNotes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await notesService.getNotes({
          ...filters,
          page: 1,
          per_page: 20,
        });
        if (!cancelled) {
          setNotes(response.data);
          setTotalPages(response.meta.last_page);
          setCurrentPage(response.meta.current_page);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load notes. Please try again.");
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
  }, [filters, isAuthenticated]);

  const handleFiltersChange = useCallback((newFilters: NotesFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (currentPage < totalPages && !isLoadingMore) {
      setIsLoadingMore(true);
      notesService
        .getNotes({ ...filters, page: currentPage + 1, per_page: 20 })
        .then((response) => {
          setNotes((prev) => [...prev, ...response.data]);
          setTotalPages(response.meta.last_page);
          setCurrentPage(response.meta.current_page);
        })
        .catch(() => {
          // Silently fail on load more
        })
        .finally(() => {
          setIsLoadingMore(false);
        });
    }
  }, [currentPage, totalPages, isLoadingMore, filters]);

  if (authLoading) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto">
          <LoadingState />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppLayout>
      <div className="p-4 max-w-2xl mx-auto space-y-6 pb-20 md:pb-4">
        <PageHeader
          title="Notes"
          description="Browse and share study notes"
          actions={
            <Link href="/notes/new">
              <Button size="sm">
                <Plus className="size-4" />
                New Note
              </Button>
            </Link>
          }
        />

        <NoteFilters filters={filters} onFiltersChange={handleFiltersChange} />

        {isLoading && <LoadingState message="Loading notes..." />}

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters({});
                setCurrentPage(1);
              }}
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !error && notes.length === 0 && (
          <EmptyState
            title="No notes found"
            description="Try adjusting your filters or create your first note."
            action={
              <Link href="/notes/new">
                <Button size="sm">Create a Note</Button>
              </Link>
            }
          />
        )}

        {!isLoading && !error && notes.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>

            {currentPage < totalPages && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
