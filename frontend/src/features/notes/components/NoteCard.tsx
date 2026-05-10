"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Note,
  VISIBILITY_LABELS,
  MODE_LABELS,
  NoteVisibility,
} from "@/types/note";
import { cn } from "@/lib/utils";
import { GraduationCap, Tag, Calendar, Layers } from "lucide-react";

interface NoteCardProps {
  note: Note;
}

const VISIBILITY_COLORS: Record<NoteVisibility, string> = {
  private: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  classroom: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  public: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  specific_users: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

export function NoteCard({ note }: NoteCardProps) {
  return (
    <Link href={`/notes/${note.id}`}>
      <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="pt-4 pb-4 space-y-2.5">
          {/* Mode badge */}
          <div className="flex items-center justify-between">
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

          {/* Title */}
          <h3 className="font-medium text-sm leading-snug line-clamp-2">
            {note.title}
          </h3>

          {/* Content preview */}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {note.content}
          </p>

          {/* Meta row */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {note.subject && (
              <span className="inline-flex items-center gap-1">
                <Tag className="size-3" />
                {note.subject}
              </span>
            )}
            {note.grade && (
              <span className="inline-flex items-center gap-1">
                <GraduationCap className="size-3" />
                Grade {note.grade}
              </span>
            )}
          </div>

          {/* Classroom indicator */}
          {note.classroom && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Layers className="size-3" />
              <span className="truncate">{note.classroom.name}</span>
            </div>
          )}

          {/* Author and date */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
            <span>{note.author.name}</span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(note.created_at).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
