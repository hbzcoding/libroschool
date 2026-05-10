"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form";
import { SchoolSelector } from "@/components/SchoolSelector";
import { GradeSelector } from "@/components/GradeSelector";
import { TrackSelector } from "@/components/TrackSelector";
import { bookRequestsService } from "@/services/bookRequests";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const requestSchema = z.object({
  school_id: z.number().optional(), // Handled separately via state
  title: z.string().min(1, "Title is required").max(255),
  isbn: z.string().max(20).optional(),
  subject: z.string().max(100).optional(),
  grade: z.number().min(1).max(5).optional().nullable(),
  track: z.string().max(50).optional().nullable(),
  max_price: z
    .number()
    .min(0, "Price must be positive")
    .max(10000, "Price too high")
    .optional()
    .nullable(),
  description: z.string().max(2000).optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface CreateRequestFormProps {
  className?: string;
}

export function CreateRequestForm({ className }: CreateRequestFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [schoolId, setSchoolId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  const onSubmit = async (data: RequestFormData) => {
    if (!schoolId) {
      setFieldErrors({ school_id: "School is required" });
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const request = await bookRequestsService.createRequest({
        ...data,
        school_id: schoolId,
        max_price: data.max_price ?? null,
      });

      router.push(`/requests/${request.id}`);
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
          Book Title <span className="text-destructive">*</span>
        </label>
        <Input
          id="title"
          {...register("title")}
          placeholder="What book are you looking for?"
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
          School <span className="text-destructive">*</span>
        </label>
        <SchoolSelector
          value={schoolId}
          onChange={(value) => setSchoolId(value)}
        />
        {fieldErrors.school_id && (
          <FormMessage>{fieldErrors.school_id}</FormMessage>
        )}
      </div>

      {/* Max Price */}
      <div className="space-y-2">
        <label htmlFor="max_price" className="text-sm font-medium">
          Budget (&euro;)
        </label>
        <Input
          id="max_price"
          type="number"
          step="0.5"
          min="0"
          {...register("max_price", { valueAsNumber: true })}
          placeholder="Maximum you&apos;re willing to pay"
          disabled={isSubmitting}
          aria-invalid={!!formErrors.max_price}
        />
        {(formErrors.max_price || fieldErrors.max_price) && (
          <FormMessage>{(formErrors.max_price?.message || fieldErrors.max_price) as string}</FormMessage>
        )}
      </div>

      {/* ISBN */}
      <div className="space-y-2">
        <label htmlFor="isbn" className="text-sm font-medium">ISBN</label>
        <Input
          id="isbn"
          {...register("isbn")}
          placeholder="ISBN-10 or ISBN-13 (optional)"
          disabled={isSubmitting}
        />
        {(formErrors.isbn || fieldErrors.isbn) && (
          <FormMessage>{(formErrors.isbn?.message || fieldErrors.isbn) as string}</FormMessage>
        )}
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
        {(formErrors.subject || fieldErrors.subject) && (
          <FormMessage>{(formErrors.subject?.message || fieldErrors.subject) as string}</FormMessage>
        )}
      </div>

      {/* Grade & Track */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Grade</label>
          <GradeSelector
            value={watch("grade") || null}
            onChange={(value) => setValue("grade", value)}
          />
          {(formErrors.grade || fieldErrors.grade) && (
            <FormMessage>{(formErrors.grade?.message || fieldErrors.grade) as string}</FormMessage>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Track</label>
          <TrackSelector
            value={watch("track") || null}
            onChange={(value) => setValue("track", value)}
          />
          {(formErrors.track || fieldErrors.track) && (
            <FormMessage>{(formErrors.track?.message || fieldErrors.track) as string}</FormMessage>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <textarea
          id="description"
          {...register("description")}
          placeholder="Additional details about what you&apos;re looking for..."
          disabled={isSubmitting}
          rows={4}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
        {(formErrors.description || fieldErrors.description) && (
          <FormMessage>{(formErrors.description?.message || fieldErrors.description) as string}</FormMessage>
        )}
      </div>

      {/* Submit button */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            Creating...
          </>
        ) : (
          "Create Book Request"
        )}
      </Button>
    </form>
  );
}
