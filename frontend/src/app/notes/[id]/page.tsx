"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/Layouts";
import { LoadingState, EmptyState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { notesService } from "@/services/notes";
import {
  Note,
  VISIBILITY_LABELS,
  MODE_LABELS,
  NoteVisibility,
} from "@/types/note";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { ReportButton } from "@/components/ReportButton";
import {
  ArrowLeft,
  User,
  Calendar,
  Tag,
  GraduationCap,
  Layers,
  Pencil,
  Trash2,
  FileText,
  School,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const VISIBILITY_COLORS: Record<NoteVisibility, string> = {
  private: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  classroom: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  public: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  specific_users: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = parseInt(params.id as string, 10);
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
        const response = await notesService.getNote(noteId);
        if (!cancelled) {
          setNote(response);
        }
      } catch {
        if (!cancelled) {
          setError(t("notes.loadError"));
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

  const isAuthor = note && user && note.author.id === user.id;

  const handleDelete = async () => {
    if (!note) return;
    setIsUpdating(true);
    try {
      await notesService.deleteNote(note.id);
      router.push("/notes");
    } catch {
      alert(t("common.error"));
      setIsUpdating(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto">
          <LoadingState message={t("notes.loadingNotes")} />
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
            title={t("notes.noteNotFound")}
            description={error || t("notes.noteNotFoundDesc")}
            action={
              <Link href="/notes">
                <Button size="sm">{t("notes.browseTitle")}</Button>
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
          href="/notes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          {t("notes.backToNotes")}
        </Link>

        {/* Title and badges */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
              {MODE_LABELS[note.mode]}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                VISIBILITY_COLORS[note.visibility]
              )}
            >
              {VISIBILITY_LABELS[note.visibility]}
            </span>
          </div>
          <h1 className="text-xl font-semibold leading-snug">{note.title}</h1>
        </div>

        {/* Author actions */}
        {isAuthor && (
          <Card className="border-dashed">
            <CardContent className="pt-4 pb-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                {t("notes.authorActions")}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href={`/notes/${note.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="size-3.5 mr-1.5" />
                    {t("common.save")}
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isUpdating}
                >
                  <Trash2 className="size-3.5 mr-1.5" />
                  {t("common.delete")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Note content */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
              <FileText className="size-3.5" />
              <span>{t("notes.fields.content")}</span>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {note.content}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Subject */}
              {note.subject && (
                <div className="flex items-start gap-2">
                  <Tag className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("notes.fields.subject")}</p>
                    <p className="text-sm font-medium">{note.subject}</p>
                  </div>
                </div>
              )}

              {/* Grade */}
              {note.grade && (
                <div className="flex items-start gap-2">
                  <GraduationCap className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("notes.fields.grade")}</p>
                    <p className="text-sm font-medium">{note.grade}</p>
                  </div>
                </div>
              )}

              {/* School */}
              {note.school && (
                <div className="flex items-start gap-2">
                  <School className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("notes.fields.school")}</p>
                    <p className="text-sm font-medium">{note.school.name}</p>
                  </div>
                </div>
              )}

              {/* Classroom */}
              {note.classroom && (
                <div className="flex items-start gap-2">
                  <Layers className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("notes.fields.classroom")}</p>
                    <p className="text-sm font-medium">{note.classroom.name}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Author info */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("notes.author")}</p>
                <p className="text-sm font-medium">{note.author.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="size-3" />
          <span>{t("notes.createdOn")} {new Date(note.created_at).toLocaleDateString()}</span>
          <span className="mx-1">&middot;</span>
          <span>{t("notes.updatedOn")} {new Date(note.updated_at).toLocaleDateString()}</span>
        </div>

        {/* Specific users permissions */}
        {note.visibility === "specific_users" && note.permissions.length > 0 && (
          <Card>
            <CardContent className="pt-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                {t("notes.sharedWith", { count: note.permissions.length })}
              </p>
              <div className="flex flex-wrap gap-2">
                {note.permissions.map((perm) => (
                  <span
                    key={perm.id}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
                  >
                    <User className="size-3" />
                    {perm.user.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flashcard link */}
        {note.mode === "flashcard" && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t("notes.flashcards")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("notes.studyFlashcards")}
                  </p>
                </div>
                <Link href={`/notes/${note.id}/flashcards`}>
                  <Button size="sm" variant="outline">
                    {t("notes.study")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report button */}
        {!isAuthor && (
          <div className="pt-2">
            <ReportButton
              reportableType="Note"
              reportableId={note.id}
              label={t("notes.reportNote")}
            />
          </div>
        )}

        {/* Delete confirmation dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogTitle>{t("notes.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("notes.deleteWarning")}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
