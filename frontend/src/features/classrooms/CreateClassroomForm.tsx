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
import { TrackSelector } from "@/components/TrackSelector";
import { classroomsService } from "@/services/classrooms";
import { ClassroomJoinPolicy, ClassroomVisibility, JOIN_POLICY_LABELS, VISIBILITY_LABELS } from "@/types/classroom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

const JOIN_POLICIES: { value: ClassroomJoinPolicy; label: string }[] = [
  { value: "open", label: JOIN_POLICY_LABELS.open },
  { value: "code", label: JOIN_POLICY_LABELS.code },
  { value: "approval", label: JOIN_POLICY_LABELS.approval },
];

const VISIBILITIES: { value: ClassroomVisibility; label: string }[] = [
  { value: "public", label: VISIBILITY_LABELS.public },
  { value: "private", label: VISIBILITY_LABELS.private },
];

const classroomSchema = z.object({
  academic_year: z
    .string()
    .min(1, "Academic year is required")
    .regex(/^\d{4}\/\d{4}$/, "Format: YYYY/YYYY (e.g., 2025/2026)"),
  section: z
    .string()
    .min(1, "Section is required")
    .max(5, "Section too long"),
  name: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
  track: z.string().max(50).optional().nullable(),
  join_policy: z.enum(["open", "code", "approval"]).optional(),
  visibility: z.enum(["public", "private"]).optional(),
});

type ClassroomFormData = z.infer<typeof classroomSchema>;

interface CreateClassroomFormProps {
  className?: string;
}

export function CreateClassroomForm({ className }: CreateClassroomFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [grade, setGrade] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClassroomFormData>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      join_policy: "code",
      visibility: "private",
    },
  });

  const selectedJoinPolicy = watch("join_policy");
  const selectedVisibility = watch("visibility");

  const onSubmit = async (data: ClassroomFormData) => {
    if (!schoolId) {
      setFieldErrors({ school_id: t("classrooms.fields.schoolRequired") });
      return;
    }
    if (!grade) {
      setFieldErrors({ grade: t("classrooms.fields.gradeRequired") });
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const classroom = await classroomsService.createClassroom({
        school_id: schoolId,
        academic_year: data.academic_year,
        grade: grade,
        section: data.section,
        name: data.name,
        description: data.description,
        track: data.track,
        join_policy: data.join_policy,
        visibility: data.visibility,
      });

      router.push(`/classes/${classroom.id}`);
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
      Object.entries(fieldErrors).map(([k, v]) => [
        k,
        { message: v },
      ])
    ),
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-6", className)}
    >
      {/* School */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t("classrooms.fields.school")} <span className="text-destructive">*</span>
        </label>
        <SchoolSelector
          value={schoolId}
          onChange={(value) => {
            setSchoolId(value);
            setFieldErrors((prev) => {
              const next = { ...prev };
              delete next.school_id;
              return next;
            });
          }}
        />
        {fieldErrors.school_id && (
          <FormMessage>{fieldErrors.school_id}</FormMessage>
        )}
      </div>

      {/* Academic Year */}
      <div className="space-y-2">
        <label htmlFor="academic_year" className="text-sm font-medium">
          {t("classrooms.fields.academicYear")} <span className="text-destructive">*</span>
        </label>
        <Input
          id="academic_year"
          {...register("academic_year")}
          placeholder={t("classrooms.fields.academicYearPlaceholder")}
          disabled={isSubmitting}
          aria-invalid={!!formErrors.academic_year}
        />
        {(formErrors.academic_year || fieldErrors.academic_year) && (
          <FormMessage>
            {(formErrors.academic_year?.message ||
              fieldErrors.academic_year) as string}
          </FormMessage>
        )}
      </div>

      {/* Grade & Section */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("classrooms.fields.grade")} <span className="text-destructive">*</span>
          </label>
          <GradeSelector
            value={grade}
            onChange={(value) => {
              setGrade(value);
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.grade;
                return next;
              });
            }}
          />
          {fieldErrors.grade && (
            <FormMessage>{fieldErrors.grade}</FormMessage>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="section" className="text-sm font-medium">
            {t("classrooms.fields.section")} <span className="text-destructive">*</span>
          </label>
          <Input
            id="section"
            {...register("section")}
            placeholder={t("classrooms.fields.sectionPlaceholder")}
            disabled={isSubmitting}
            maxLength={5}
            aria-invalid={!!formErrors.section}
          />
          {(formErrors.section || fieldErrors.section) && (
            <FormMessage>
              {(formErrors.section?.message ||
                fieldErrors.section) as string}
            </FormMessage>
          )}
        </div>
      </div>

      {/* Track */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("classrooms.fields.track")}</label>
        <TrackSelector
          value={watch("track") || null}
          onChange={(value) => setValue("track", value)}
        />
        {(formErrors.track || fieldErrors.track) && (
          <FormMessage>
            {(formErrors.track?.message || fieldErrors.track) as string}
          </FormMessage>
        )}
      </div>

      {/* Name (optional) */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          {t("classrooms.fields.name")}
        </label>
        <Input
          id="name"
          {...register("name")}
          placeholder={t("classrooms.fields.namePlaceholder")}
          disabled={isSubmitting}
          aria-invalid={!!formErrors.name}
        />
        {(formErrors.name || fieldErrors.name) && (
          <FormMessage>
            {(formErrors.name?.message || fieldErrors.name) as string}
          </FormMessage>
        )}
        <p className="text-xs text-muted-foreground">
          {t("classrooms.fields.nameHint")}
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          {t("classrooms.fields.description")}
        </label>
        <textarea
          id="description"
          {...register("description")}
          placeholder={t("classrooms.fields.descriptionPlaceholder")}
          disabled={isSubmitting}
          rows={4}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
        {(formErrors.description || fieldErrors.description) && (
          <FormMessage>
            {(formErrors.description?.message ||
              fieldErrors.description) as string}
          </FormMessage>
        )}
      </div>

      {/* Join Policy */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("classrooms.fields.joinPolicy")}</label>
        <Select
          value={selectedJoinPolicy}
          onValueChange={(value) =>
            setValue("join_policy", value as ClassroomJoinPolicy)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("classrooms.fields.selectJoinPolicy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {JOIN_POLICIES.map((policy) => (
                <SelectItem key={policy.value} value={policy.value}>
                  {policy.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {(formErrors.join_policy || fieldErrors.join_policy) && (
          <FormMessage>
            {(formErrors.join_policy?.message ||
              fieldErrors.join_policy) as string}
          </FormMessage>
        )}
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("classrooms.fields.visibility")}</label>
        <Select
          value={selectedVisibility}
          onValueChange={(value) =>
            setValue("visibility", value as ClassroomVisibility)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("classrooms.fields.selectVisibility")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {VISIBILITIES.map((vis) => (
                <SelectItem key={vis.value} value={vis.value}>
                  {vis.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {(formErrors.visibility || fieldErrors.visibility) && (
          <FormMessage>
            {(formErrors.visibility?.message ||
              fieldErrors.visibility) as string}
          </FormMessage>
        )}
      </div>

      {/* Submit button */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            {t("common.creating")}
          </>
        ) : (
          t("classrooms.actions.create")
        )}
      </Button>
    </form>
  );
}
