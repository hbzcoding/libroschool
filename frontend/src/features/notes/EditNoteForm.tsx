"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormMessage } from "@/components/ui/form";
import { SchoolSelector } from "@/components/SchoolSelector";
import { GradeSelector } from "@/components/GradeSelector";
import { VisibilitySelector } from "./components/VisibilitySelector";
import { notesService } from "@/services/notes";
import { Note, MODE_LABELS, NoteMode, NoteVisibility } from "@/types/note";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES: { value: NoteMode; label: string }[] = [
  { value: "note", label: MODE_LABELS.note },
  { value: "flashcard", label: MODE_LABELS.flashcard },
];

const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().min(1, "Content is required").max(50000),
  subject: z.string().max(100).optional(),
  grade: z.number().min(1).max(5).optional().nullable(),
  visibility: z.enum(["private", "classroom", "public", "specific_users"]),
  mode: z.enum(["note", "flashcard"]),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface EditNoteFormProps {
  note: Note;
  className?: string;
}

export function EditNoteForm({ note, className }: EditNoteFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [schoolId, setSchoolId] = useState<number | null>(note.school?.id || null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: note.title,
      content: note.content,
      subject: note.subject || "",
      grade: note.grade,
      visibility: note.visibility as NoteVisibility,
      mode: note.mode as NoteMode,
    },
  });

  const selectedMode = watch("mode");
  const selectedVisibility = watch("visibility");

  const onSubmit = async (data: NoteFormData) => {
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      await notesService.updateNote(note.id, {
        ...data,
        school_id: schoolId || undefined,
      });

      router.push(`/notes/${note.id}`);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "errors" in error) {
        const apiError = error as { errors: Record<string, string[]> };
        if (apiError.errors) {
          const newErrors: Record<string, string> = {};
          for (const [field, messages] of Object.entries(apiError.errors)) {
            if (messages.length > 0) {
              newErrors[field] = messages[0];
            }
          }
          setFieldErrors(newErrors);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formErrors = {
    ...errors,
    ...Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, { message: v }])),
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-6", className)}>
      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title <span className="text-destructive">*</span>
        </label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Note title"
          disabled={isSubmitting}
          aria-invalid={!!formErrors.title}
        />
        {(formErrors.title || fieldErrors.title) && (
          <FormMessage>{(formErrors.title?.message || fieldErrors.title) as string}</FormMessage>
        )}
      </div>

      {/* Mode */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select
          value={selectedMode}
          onValueChange={(value) => setValue("mode", value as NoteMode)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {MODES.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Visibility */}
      <VisibilitySelector
        value={selectedVisibility}
        onChange={(value) => setValue("visibility", value)}
        classroomName={note.classroom?.name}
        disabled={isSubmitting}
      />

      {/* School (optional) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">School (optional)</label>
        <SchoolSelector value={schoolId} onChange={(value) => setSchoolId(value)} />
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium">Subject</label>
        <Input
          id="subject"
          {...register("subject")}
          placeholder="e.g., Mathematics, History..."
          disabled={isSubmitting}
        />
      </div>

      {/* Grade */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Grade</label>
        <GradeSelector
          value={watch("grade") || null}
          onChange={(value) => setValue("grade", value)}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          Content <span className="text-destructive">*</span>
        </label>
        <textarea
          id="content"
          {...register("content")}
          placeholder={selectedMode === "flashcard"
            ? "Create flashcards from this content..."
            : "Write your note content here..."}
          disabled={isSubmitting}
          rows={12}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
        {(formErrors.content || fieldErrors.content) && (
          <FormMessage>{(formErrors.content?.message || fieldErrors.content) as string}</FormMessage>
        )}
      </div>

      {/* Submit button */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}
