"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CreateFlashcardData } from "@/types/flashcard";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

const flashcardItemSchema = z.object({
  front_text: z.string().min(1, "Front text is required").max(1000),
  back_text: z.string().min(1, "Back text is required").max(1000),
});

interface FlashcardItem {
  id: string;
  front_text: string;
  back_text: string;
}

interface CreateFlashcardsBatchFormProps {
  onSubmit: (flashcards: CreateFlashcardData[]) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export function CreateFlashcardsBatchForm({
  onSubmit,
  onCancel,
  className,
}: CreateFlashcardsBatchFormProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [flashcardItems, setFlashcardItems] = useState<FlashcardItem[]>([
    { id: "1", front_text: "", back_text: "" },
  ]);

  const generateId = () => Math.random().toString(36).substring(7);

  const addItem = () => {
    setFlashcardItems((prev) => [
      ...prev,
      { id: generateId(), front_text: "", back_text: "" },
    ]);
  };

  const removeItem = (id: string) => {
    if (flashcardItems.length === 1) {
      return;
    }
    setFlashcardItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: "front_text" | "back_text", value: string) => {
    setFlashcardItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const validateItems = (): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    flashcardItems.forEach((item, index) => {
      const result = flashcardItemSchema.safeParse(item);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          errors[`${item.id}-${field}`] = `${t("flashcards.title")} ${index + 1}: ${issue.message}`;
        });
      }
    });

    return { valid: Object.keys(errors).length === 0, errors };
  };

  const handleFormSubmit = async () => {
    const validation = validateItems();
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const flashcards: CreateFlashcardData[] = flashcardItems.map((item) => ({
        front_text: item.front_text,
        back_text: item.back_text,
      }));

      await onSubmit(flashcards);
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

  return (
    <div className={cn("space-y-6", className)}>
      {/* Cards list */}
      <div className="space-y-4">
        {flashcardItems.map((item, index) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 space-y-3"
          >
            {/* Card number */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {t("flashcards.title")} {index + 1}
              </span>
              {flashcardItems.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  disabled={isSubmitting}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>

            {/* Front text */}
            <div className="space-y-2">
              <label htmlFor={`front-${item.id}`} className="text-xs font-medium">
                {t("flashcards.fields.frontText")} <span className="text-destructive">*</span>
              </label>
              <textarea
                id={`front-${item.id}`}
                value={item.front_text}
                onChange={(e) => updateItem(item.id, "front_text", e.target.value)}
                placeholder={t("flashcards.fields.frontPlaceholder")}
                disabled={isSubmitting}
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              {fieldErrors[`${item.id}-front_text`] && (
                <p className="text-sm text-destructive">
                  {fieldErrors[`${item.id}-front_text`]}
                </p>
              )}
            </div>

            {/* Back text */}
            <div className="space-y-2">
              <label htmlFor={`back-${item.id}`} className="text-xs font-medium">
                {t("flashcards.fields.backText")} <span className="text-destructive">*</span>
              </label>
              <textarea
                id={`back-${item.id}`}
                value={item.back_text}
                onChange={(e) => updateItem(item.id, "back_text", e.target.value)}
                placeholder={t("flashcards.fields.backPlaceholder")}
                disabled={isSubmitting}
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              {fieldErrors[`${item.id}-back_text`] && (
                <p className="text-sm text-destructive">
                  {fieldErrors[`${item.id}-back_text`]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add card button */}
      <Button
        variant="outline"
        size="sm"
        onClick={addItem}
        disabled={isSubmitting}
        className="w-full"
      >
        <Plus className="size-4 mr-2" />
        {t("flashcards.actions.addAnother")}
      </Button>

      {/* Submit buttons */}
      <div className="flex items-center gap-2 pt-4 border-t">
        <Button onClick={handleFormSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              {t("flashcards.actions.creatingMultiple", { count: flashcardItems.length })}
            </>
          ) : (
            t("flashcards.actions.createMultiple", { count: flashcardItems.length })
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </div>
  );
}