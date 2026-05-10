"use client";

import { useState, useCallback } from "react";
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
import { TrackSelector } from "@/components/TrackSelector";
import { ImageUploader } from "./components/ImageUploader";
import { booksService } from "@/services/books";
import { CONDITION_LABELS, BookCondition } from "@/types/book";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

const CONDITIONS: { value: BookCondition; label: string }[] = [
  { value: "new", label: CONDITION_LABELS.new },
  { value: "very_good", label: CONDITION_LABELS.very_good },
  { value: "good", label: CONDITION_LABELS.good },
  { value: "acceptable", label: CONDITION_LABELS.acceptable },
];

const bookSchema = z.object({
  school_id: z.number().optional(), // Handled separately via state
  title: z.string().min(1, "Title is required").max(255),
  condition: z.enum(["new", "very_good", "good", "acceptable"], {
    message: "Condition is required",
  }),
  price: z
    .number({ message: "Price is required" })
    .min(0, "Price must be positive")
    .max(10000, "Price too high"),
  isbn: z.string().max(20).optional(),
  subject: z.string().max(100).optional(),
  grade: z.number().min(1).max(5).optional().nullable(),
  track: z.string().max(50).optional().nullable(),
  publisher: z.string().max(100).optional(),
  author: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
});

type BookFormData = z.infer<typeof bookSchema>;

interface CreateBookFormProps {
  className?: string;
}

export function CreateBookForm({ className }: CreateBookFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [schoolId, setSchoolId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      condition: "new",
    },
  });

  const selectedCondition = watch("condition");

  const handleImageUpload = useCallback(async (files: File[]) => {
    setPendingImages(files);
    setImageError(null);
  }, []);

  const onSubmit = async (data: BookFormData) => {
    if (!schoolId) {
      setFieldErrors({ school_id: t("books.fields.schoolRequired") });
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setImageError(null);

    try {
      const book = await booksService.createBook({
        ...data,
        school_id: schoolId,
      });

      // Upload images if any
      if (pendingImages.length > 0) {
        try {
          for (const file of pendingImages) {
            await booksService.uploadImage(book.id, file);
          }
        } catch {
          setImageError(t("books.imageUploadFailed"));
          router.push(`/books/${book.id}`);
          return;
        }
      }

      router.push(`/books/${book.id}`);
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

  const formErrors = { ...errors, ...Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, { message: v }])) };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-6", className)}
    >
      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          {t("books.fields.title")} <span className="text-destructive">*</span>
        </label>
        <Input
          id="title"
          {...register("title")}
          placeholder={t("books.fields.titlePlaceholder")}
          disabled={isSubmitting}
          aria-invalid={!!formErrors.title}
        />
        {(formErrors.title || fieldErrors.title) && (
          <FormMessage>{(formErrors.title?.message || fieldErrors.title) as string}</FormMessage>
        )}
      </div>

      {/* School */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t("books.fields.school")} <span className="text-destructive">*</span>
        </label>
        <SchoolSelector
          value={schoolId}
          onChange={(value) => setSchoolId(value)}
        />
        {fieldErrors.school_id && (
          <FormMessage>{fieldErrors.school_id}</FormMessage>
        )}
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t("books.fields.condition")} <span className="text-destructive">*</span>
        </label>
        <Select
          value={selectedCondition}
          onValueChange={(value) =>
            setValue("condition", value as BookCondition)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("selectors.selectCondition")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {CONDITIONS.map((condition) => (
                <SelectItem key={condition.value} value={condition.value}>
                  {condition.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {(formErrors.condition || fieldErrors.condition) && (
          <FormMessage>{(formErrors.condition?.message || fieldErrors.condition) as string}</FormMessage>
        )}
      </div>

      {/* Price */}
      <div className="space-y-2">
        <label htmlFor="price" className="text-sm font-medium">
          {t("books.price")} (&euro;) <span className="text-destructive">*</span>
        </label>
        <Input
          id="price"
          type="number"
          step="0.5"
          min="0"
          {...register("price", { valueAsNumber: true })}
          placeholder="0.00"
          disabled={isSubmitting}
          aria-invalid={!!formErrors.price}
        />
        {(formErrors.price || fieldErrors.price) && (
          <FormMessage>{(formErrors.price?.message || fieldErrors.price) as string}</FormMessage>
        )}
      </div>

      {/* ISBN */}
      <div className="space-y-2">
        <label htmlFor="isbn" className="text-sm font-medium">{t("books.fields.isbn")}</label>
        <Input
          id="isbn"
          {...register("isbn")}
          placeholder={t("books.fields.isbnPlaceholder")}
          disabled={isSubmitting}
        />
        {(formErrors.isbn || fieldErrors.isbn) && (
          <FormMessage>{(formErrors.isbn?.message || fieldErrors.isbn) as string}</FormMessage>
        )}
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium">{t("books.fields.subject")}</label>
        <Input
          id="subject"
          {...register("subject")}
          placeholder={t("books.fields.subjectPlaceholder")}
          disabled={isSubmitting}
        />
        {(formErrors.subject || fieldErrors.subject) && (
          <FormMessage>{(formErrors.subject?.message || fieldErrors.subject) as string}</FormMessage>
        )}
      </div>

      {/* Grade & Track */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("books.fields.grade")}</label>
          <GradeSelector
            value={watch("grade") || null}
            onChange={(value) => setValue("grade", value)}
          />
          {(formErrors.grade || fieldErrors.grade) && (
            <FormMessage>{(formErrors.grade?.message || fieldErrors.grade) as string}</FormMessage>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("books.fields.track")}</label>
          <TrackSelector
            value={watch("track") || null}
            onChange={(value) => setValue("track", value)}
          />
          {(formErrors.track || fieldErrors.track) && (
            <FormMessage>{(formErrors.track?.message || fieldErrors.track) as string}</FormMessage>
          )}
        </div>
      </div>

      {/* Publisher */}
      <div className="space-y-2">
        <label htmlFor="publisher" className="text-sm font-medium">{t("books.fields.publisher")}</label>
        <Input
          id="publisher"
          {...register("publisher")}
          placeholder={t("books.fields.publisherPlaceholder")}
          disabled={isSubmitting}
        />
        {(formErrors.publisher || fieldErrors.publisher) && (
          <FormMessage>{(formErrors.publisher?.message || fieldErrors.publisher) as string}</FormMessage>
        )}
      </div>

      {/* Author */}
      <div className="space-y-2">
        <label htmlFor="author" className="text-sm font-medium">{t("books.fields.author")}</label>
        <Input
          id="author"
          {...register("author")}
          placeholder={t("books.fields.authorPlaceholder")}
          disabled={isSubmitting}
        />
        {(formErrors.author || fieldErrors.author) && (
          <FormMessage>{(formErrors.author?.message || fieldErrors.author) as string}</FormMessage>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">{t("books.fields.description")}</label>
        <textarea
          id="description"
          {...register("description")}
          placeholder={t("books.fields.descriptionPlaceholder")}
          disabled={isSubmitting}
          rows={4}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
        {(formErrors.description || fieldErrors.description) && (
          <FormMessage>{(formErrors.description?.message || fieldErrors.description) as string}</FormMessage>
        )}
      </div>

      {/* Image Uploader */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("books.fields.images")}</label>
        <ImageUploader
          onUpload={handleImageUpload}
          error={imageError || undefined}
        />
      </div>

      {/* Submit button */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            {t("common.creating")}
          </>
        ) : (
          t("books.actions.createBook")
        )}
      </Button>
    </form>
  );
}