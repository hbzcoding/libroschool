"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/Layouts";
import { LoadingState, EmptyState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FlashcardViewer } from "@/features/flashcards/components/FlashcardViewer";
import { FlashcardCard } from "@/features/flashcards/components/FlashcardCard";
import { FlashcardEditor } from "@/features/flashcards/components/FlashcardEditor";
import { flashcardsService } from "@/services/flashcards";
import { notesService } from "@/services/notes";
import { Flashcard, CreateFlashcardData, UpdateFlashcardData } from "@/types/flashcard";
import { Note } from "@/types/note";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  Plus,
  Layers,
  Grid,
  BookOpen,
  Pencil,
} from "lucide-react";

type ViewMode = "study" | "list";

export default function FlashcardsPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = parseInt(params.id as string, 10);
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [note, setNote] = useState<Note | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("study");

  // Edit/delete states
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [deletingCard, setDeletingCard] = useState<Flashcard | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !noteId || isNaN(noteId)) return;

    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [noteData, flashcardsData] = await Promise.all([
          notesService.getNote(noteId),
          flashcardsService.getFlashcards(noteId),
        ]);
        if (!cancelled) {
          setNote(noteData);
          setFlashcards(flashcardsData);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load flashcards. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, noteId]);

  const isAuthor = note && user && note.author.id === user.id;

  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card);
  };

  const handleDeleteCard = (card: Flashcard) => {
    setDeletingCard(card);
  };

  const handleUpdateCard = async (data: CreateFlashcardData | UpdateFlashcardData) => {
    if (!editingCard) return;
    setIsUpdating(true);
    try {
      const updated = await flashcardsService.updateFlashcard(editingCard.id, data);
      setFlashcards((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setEditingCard(null);
    } catch {
      alert("Failed to update flashcard.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCard) return;
    setIsUpdating(true);
    try {
      await flashcardsService.deleteFlashcard(deletingCard.id);
      setFlashcards((prev) => prev.filter((c) => c.id !== deletingCard.id));
      setDeletingCard(null);
    } catch {
      alert("Failed to delete flashcard.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto">
          <LoadingState message="Loading flashcards..." />
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
            title="Flashcards not found"
            description={error || "This note may have been removed or you don't have access."}
            action={
              <Link href="/notes">
                <Button size="sm">Browse Notes</Button>
              </Link>
            }
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 max-w-2xl mx-auto space-y-6 pb-20 md:pb-4">
        {/* Back link */}
        <Link
          href={`/notes/${noteId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Note
        </Link>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            <h1 className="text-xl font-semibold">Flashcards</h1>
          </div>
          <p className="text-sm text-muted-foreground">{note.title}</p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "study" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("study")}
          >
            <BookOpen className="size-3.5 mr-1.5" />
            Study
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <Grid className="size-3.5 mr-1.5" />
            List
          </Button>
          {isAuthor && (
            <Link href={`/notes/${noteId}/flashcards/new`} className="ml-auto">
              <Button size="sm">
                <Plus className="size-3.5 mr-1.5" />
                Add Cards
              </Button>
            </Link>
          )}
        </div>

        {/* Empty state */}
        {flashcards.length === 0 && (
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <Layers className="size-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-1">No flashcards yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                {isAuthor
                  ? "Create flashcards to start studying."
                  : "The author hasn't added any flashcards yet."}
              </p>
              {isAuthor && (
                <Link href={`/notes/${noteId}/flashcards/new`}>
                  <Button size="sm">
                    <Plus className="size-3.5 mr-1.5" />
                    Create Flashcards
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Study mode */}
        {flashcards.length > 0 && viewMode === "study" && !editingCard && (
          <FlashcardViewer
            flashcards={flashcards}
            onEdit={isAuthor ? handleEditCard : undefined}
            onDelete={isAuthor ? handleDeleteCard : undefined}
            isAuthor={!!isAuthor}
          />
        )}

        {/* List mode */}
        {flashcards.length > 0 && viewMode === "list" && !editingCard && (
          <div className="grid grid-cols-1 gap-3">
            {flashcards.map((card) => (
              <FlashcardCard
                key={card.id}
                flashcard={card}
                onClick={() => handleEditCard(card)}
              />
            ))}
          </div>
        )}

        {/* Edit mode */}
        {editingCard && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Pencil className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-medium">Edit Flashcard #{editingCard.position}</h2>
              </div>
              <FlashcardEditor
                flashcard={editingCard}
                onSubmit={handleUpdateCard}
                onCancel={() => setEditingCard(null)}
              />
            </CardContent>
          </Card>
        )}

        {/* Delete confirmation */}
        <AlertDialog
          open={!!deletingCard}
          onOpenChange={(open) => !open && setDeletingCard(null)}
        >
          <AlertDialogContent>
            <AlertDialogTitle>Delete Flashcard</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this flashcard? This action cannot be undone.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isUpdating}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isUpdating ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}