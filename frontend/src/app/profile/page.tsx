"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { AppLayout } from "@/components/Layouts";
import { PageHeader } from "@/components/States";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SchoolSelector } from "@/components/SchoolSelector";
import { GradeSelector } from "@/components/GradeSelector";
import { TrackSelector } from "@/components/TrackSelector";
import { UpdateProfileData } from "@/types/user";
import { authService } from "@/services/auth";
import { ApiError } from "@/types/api";

const profileSchema = z.object({
  name: z.string().min(2, "profile.nameMinLength"),
  school_id: z.number().nullable(),
  grade: z.number().min(1).max(5).nullable(),
  track: z.string().nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated, refreshUser } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Track selector values in local state to avoid react-hook-form watch
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      school_id: null,
      grade: null,
      track: null,
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setValue("name", user.name);
      setValue("school_id", user.school_id);
      setValue("grade", user.grade);
      setValue("track", user.track);
    }
  }, [user, setValue]);

  // Initialize selectors when user is loaded
  useEffect(() => {
    if (user) {
      // Using setTimeout to avoid cascading render issue
      const timer = setTimeout(() => {
        setSelectedSchoolId(user.school_id);
        setSelectedGrade(user.grade);
        setSelectedTrack(user.track);
      }, 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [user]);

  const onSubmit = async (data: ProfileFormData) => {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const updateData: UpdateProfileData = {
        name: data.name,
        school_id: selectedSchoolId,
        grade: selectedGrade,
        track: selectedTrack,
      };
      await authService.updateProfile(updateData);
      await refreshUser();
      setSuccess(t("profile.updateSuccess"));
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(
        apiError.message || t("profile.updateFailed")
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="p-4 max-w-2xl mx-auto space-y-6">
        <PageHeader title={t("profile.title")} />

        <Card>
          <CardHeader>
            <CardTitle>{t("profile.accountInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-green-500/10 text-green-600 text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">{t("profile.name")}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t("profile.namePlaceholder")}
                  {...register("name")}
                  disabled={isSaving}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{t(errors.name.message ?? "")}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("profile.email")}</Label>
                <Input
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  {t("profile.emailCannotChange")}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t("profile.school")}</Label>
                <SchoolSelector
                  value={selectedSchoolId}
                  onChange={(schoolId) => {
                    setSelectedSchoolId(schoolId);
                    setValue("school_id", schoolId);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("profile.grade")}</Label>
                <GradeSelector
                  value={selectedGrade}
                  onChange={(grade) => {
                    setSelectedGrade(grade);
                    setValue("grade", grade);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("profile.track")}</Label>
                <TrackSelector
                  value={selectedTrack}
                  onChange={(track) => {
                    setSelectedTrack(track);
                    setValue("track", track);
                  }}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? t("profile.saving") : t("profile.saveChanges")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}