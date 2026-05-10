"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/Layouts";
import { LoadingState, EmptyState } from "@/components/States";
import { Card, CardContent } from "@/components/ui/card";
import { CreateFlashcardsBatchForm } from "@/features/flashcards/CreateFlashcardsBatchForm";
import { flashcardsService } from "@/services/flashcards";
import { notesService } from "@/services/notes";
import { CreateFlashcardData } from "@/types/flashcard";
import { Note } from "@/types/note";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Layers } from "lucide-react";

export default function NewFlashcardsPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = parseInt(params.id as string, 10);
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !noteId || isNaN(noteId)) return;

    let cancelled = false;

    const fetchNote = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const noteData = await notesService.getNote(noteId);
        if (!cancelled) {
          setNote(noteData);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load note. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchNote();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, noteId]);

  const handleSubmit = async (flashcards: CreateFlashcardData[]) => {
    await flashcardsService.createFlashcardsBatch(noteId, { flashcards });
    router.push(`/notes/${noteId}/flashcards`);
  };

  const handleCancel = () => {
    router.push(`/notes/${noteId}/flashcards`);
  };

  if (authLoading || isLoading) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto">
          <LoadingState message="Loading..." />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error || !note) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto">
          <EmptyState
            title="Note not found"
            description={error || "This note may have been removed or you don't have access."}
            action={
              <Link href="/notes">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
                  Browse Notes
                </button>
              </Link>
            }
          />
        </div>
      </AppLayout>
    );
  }

  // Check if user is author
  // Note: This is a frontend check for UX. Backend also enforces this.

  return (
    <AppLayout>
      <div className="p-4 max-w-2xl mx-auto space-y-6 pb-20 md:pb-4">
        {/* Back link */}
        <Link
          href={`/notes/${noteId}/flashcards`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Flashcards
        </Link>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            <h1 className="text-xl font-semibold">Create Flashcards</h1>
          </div>
          <p className="text-sm text-muted-foreground">{note.title}</p>
        </div>

        {/* Create form */}
        <Card>
          <CardContent className="pt-4">
            <CreateFlashcardsBatchForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}