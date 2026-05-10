"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { Flashcard, CreateFlashcardData, UpdateFlashcardData } from "@/types/flashcard";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

const flashcardSchema = z.object({
  front_text: z.string().min(1, "Front text is required").max(1000),
  back_text: z.string().min(1, "Back text is required").max(1000),
});

type FlashcardFormData = z.infer<typeof flashcardSchema>;

interface FlashcardEditorProps {
  flashcard?: Flashcard;
  onSubmit: (data: CreateFlashcardData | UpdateFlashcardData) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export function FlashcardEditor({
  flashcard,
  onSubmit,
  onCancel,
  className,
}: FlashcardEditorProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isEditing = !!flashcard;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: {
      front_text: flashcard?.front_text || "",
      back_text: flashcard?.back_text || "",
    },
  });

  const handleFormSubmit = async (data: FlashcardFormData) => {
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      await onSubmit(data);
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
    ...Object.fromEntries(
      Object.entries(fieldErrors).map(([k, v]) => [k, { message: v }])
    ),
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn("space-y-4", className)}
    >
      {/* Front text */}
      <div className="space-y-2">
        <label htmlFor="front_text" className="text-sm font-medium">
          {t("flashcards.fields.frontText")} <span className="text-destructive">*</span>
        </label>
        <textarea
          id="front_text"
          {...register("front_text")}
          placeholder={t("flashcards.fields.frontPlaceholder")}
          disabled={isSubmitting}
          rows={3}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          aria-invalid={!!formErrors.front_text}
        />
        {(formErrors.front_text || fieldErrors.front_text) && (
          <FormMessage>
            {(formErrors.front_text?.message || fieldErrors.front_text) as string}
          </FormMessage>
        )}
      </div>

      {/* Back text */}
      <div className="space-y-2">
        <label htmlFor="back_text" className="text-sm font-medium">
          {t("flashcards.fields.backText")} <span className="text-destructive">*</span>
        </label>
        <textarea
          id="back_text"
          {...register("back_text")}
          placeholder={t("flashcards.fields.backPlaceholder")}
          disabled={isSubmitting}
          rows={3}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          aria-invalid={!!formErrors.back_text}
        />
        {(formErrors.back_text || fieldErrors.back_text) && (
          <FormMessage>
            {(formErrors.back_text?.message || fieldErrors.back_text) as string}
          </FormMessage>
        )}
      </div>

      {/* Submit buttons */}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              {isEditing ? t("flashcards.actions.updating") : t("flashcards.actions.saving")}
            </>
          ) : (
            isEditing ? t("flashcards.actions.update") : t("flashcards.actions.save")
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}