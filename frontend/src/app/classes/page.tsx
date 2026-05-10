"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/Layouts";
import { PageHeader, EmptyState, LoadingState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GradeSelector } from "@/components/GradeSelector";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassroomCard, JoinClassroomForm } from "@/features/classrooms";
import { classroomsService } from "@/services/classrooms";
import { ClassroomsFilters, Classroom } from "@/types/classroom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { Plus, Users, Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function ClassroomsPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ClassroomsFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const loadClassrooms = useCallback(
    async (page: number = 1, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await classroomsService.getClassrooms({
          ...filters,
          page,
          per_page: 20,
        });
        if (append) {
          setClassrooms((prev) => [...prev, ...response.data]);
        } else {
          setClassrooms(response.data);
        }
        setTotalPages(response.meta.last_page);
        setCurrentPage(response.meta.current_page);
      } catch {
        setError(t("classrooms.loadError"));
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    const fetchClassrooms = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await classroomsService.getClassrooms({
          ...filters,
          page: 1,
          per_page: 20,
        });
        if (!cancelled) {
          setClassrooms(response.data);
          setTotalPages(response.meta.last_page);
          setCurrentPage(response.meta.current_page);
        }
      } catch {
        if (!cancelled) {
          setError(t("classrooms.loadError"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchClassrooms();

    return () => {
      cancelled = true;
    };
  }, [filters, isAuthenticated]);

  const updateFilter = useCallback(
    <K extends keyof ClassroomsFilters>(key: K, value: ClassroomsFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
      setCurrentPage(1);
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (currentPage < totalPages && !isLoadingMore) {
      loadClassrooms(currentPage + 1, true);
    }
  }, [currentPage, totalPages, isLoadingMore, loadClassrooms]);

  const hasActiveFilters =
    filters.search ||
    filters.school_id ||
    filters.grade ||
    filters.academic_year ||
    filters.is_private !== undefined;

  if (authLoading) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto">
          <LoadingState />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppLayout>
      <div className="p-4 max-w-2xl mx-auto space-y-6 pb-20 md:pb-4">
        <PageHeader
          title={t("classrooms.title")}
          description={t("classrooms.browseTitle")}
          actions={
            <div className="flex items-center gap-2">
              <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                <DialogTrigger render={<Button variant="outline" size="sm" />}>
                  <Users className="size-4" />
                  {t("classrooms.join")}
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("classrooms.joinTitle")}</DialogTitle>
                  </DialogHeader>
                  <JoinClassroomForm onSuccess={() => setJoinDialogOpen(false)} />
                </DialogContent>
              </Dialog>
              <Link href="/classes/new">
                <Button size="sm">
                  <Plus className="size-4" />
                  {t("classrooms.createClass")}
                </Button>
              </Link>
            </div>
          }
        />

        {/* Filters */}
        <div className="space-y-3">
          {/* Main search row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("classrooms.searchPlaceholder")}
                value={filters.search || ""}
                onChange={(e) =>
                  updateFilter("search", e.target.value || undefined)
                }
                className="pl-8"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(showAdvanced && "bg-muted")}
            >
              <SlidersHorizontal className="size-4" />
            </Button>
          </div>

          {/* Advanced filters */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50">
              {/* Grade */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium">{t("classrooms.fields.grade")}</label>
                <GradeSelector
                  value={filters.grade || null}
                  onChange={(value) => updateFilter("grade", value || undefined)}
                />
              </div>

              {/* Academic Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium">{t("classrooms.fields.academicYear")}</label>
                <Input
                  type="text"
                  placeholder={t("classrooms.fields.academicYearPlaceholder")}
                  value={filters.academic_year || ""}
                  onChange={(e) =>
                    updateFilter("academic_year", e.target.value || undefined)
                  }
                />
              </div>

              {/* Visibility */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium">{t("classrooms.fields.visibility")}</label>
                <Select
                  value={
                    filters.is_private === undefined
                      ? "all"
                      : filters.is_private
                      ? "private"
                      : "public"
                  }
                  onValueChange={(value) => {
                    if (value === "all") {
                      updateFilter("is_private", undefined);
                    } else {
                      updateFilter("is_private", value === "private");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">{t("classrooms.visibility.all")}</SelectItem>
                      <SelectItem value="public">{t("classrooms.visibility.public")}</SelectItem>
                      <SelectItem value="private">{t("classrooms.visibility.private")}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear button */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground"
                  >
                    <X className="size-3.5 mr-1" />
                    {t("classrooms.clearFilters")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {isLoading && <LoadingState message={t("classrooms.loadingClasses")} />}

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadClassrooms(1)}
              className="mt-3"
            >
              {t("common.tryAgain")}
            </Button>
          </div>
        )}

        {!isLoading && !error && classrooms.length === 0 && (
          <EmptyState
            title={t("classrooms.noClasses")}
            description={t("classrooms.noClassesDesc")}
            action={
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger render={<Button variant="outline" size="sm" />}>
                    {t("classrooms.joinByCode")}
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("classrooms.joinTitle")}</DialogTitle>
                    </DialogHeader>
                    <JoinClassroomForm />
                  </DialogContent>
                </Dialog>
                <Link href="/classes/new">
                  <Button size="sm">{t("classrooms.createClass")}</Button>
                </Link>
              </div>
            }
          />
        )}

        {!isLoading && !error && classrooms.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {classrooms.map((classroom) => (
                <ClassroomCard key={classroom.id} classroom={classroom} />
              ))}
            </div>

            {currentPage < totalPages && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      {t("common.loading")}
                    </>
                  ) : (
                    t("classrooms.loadMore")
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
