"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/Layouts";
import { PageHeader, LoadingState, EmptyState } from "@/components/States";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notesService } from "@/services/notes";
import { Note } from "@/types/note";
import { EditNoteForm } from "@/features/notes";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { ArrowLeft } from "lucide-react";

export default function EditNotePage() {
  const params = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const noteId = Number(params.id);

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noteId) return;

    const fetchNote = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await notesService.getNote(noteId);
        setNote(response);
      } catch {
        setError(t("notes.loadError"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [noteId]);

  // Check if user is author
  if (!isLoading && note && user && note.author.id !== user.id) {
    return (
      <AppLayout>
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
          <PageHeader title={t("notes.editNoteTitle")} />
          <EmptyState
            title={t("notes.accessDenied")}
            description={t("notes.editDeniedDesc")}
            action={
              <Link href={`/notes/${noteId}`}>
                <Button variant="outline">{t("notes.viewNote")}</Button>
              </Link>
            }
          />
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
          <LoadingState message={t("notes.loadingNotes")} />
        </div>
      </AppLayout>
    );
  }

  if (error || !note) {
    return (
      <AppLayout>
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
          <PageHeader title={t("notes.editNoteTitle")} />
          <EmptyState
            title={t("notes.noteNotFound")}
            description={error || t("notes.noteNotFoundDesc")}
            action={
              <Link href="/notes">
                <Button variant="outline">{t("notes.backToNotes")}</Button>
              </Link>
            }
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-2xl mx-auto pb-20 md:pb-4">
        <div className="mb-4">
          <Link href={`/notes/${noteId}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              {t("notes.backToNote")}
            </Button>
          </Link>
        </div>

        <PageHeader title={t("notes.editNoteTitle")} description={note.title} />

        <Card>
          <CardContent className="p-6">
            <EditNoteForm note={note} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
