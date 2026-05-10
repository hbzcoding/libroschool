"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SchoolSelector } from "@/components/SchoolSelector";
import { GradeSelector } from "@/components/GradeSelector";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NotesFilters,
  NoteVisibility,
  NoteMode,
  VISIBILITY_LABELS,
  MODE_LABELS,
} from "@/types/note";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface NoteFiltersProps {
  filters: NotesFilters;
  onFiltersChange: (filters: NotesFilters) => void;
  className?: string;
}

const VISIBILITIES: { value: NoteVisibility; label: string }[] = [
  { value: "private", label: VISIBILITY_LABELS.private },
  { value: "classroom", label: VISIBILITY_LABELS.classroom },
  { value: "public", label: VISIBILITY_LABELS.public },
  { value: "specific_users", label: VISIBILITY_LABELS.specific_users },
];

const MODES: { value: NoteMode; label: string }[] = [
  { value: "note", label: MODE_LABELS.note },
  { value: "flashcard", label: MODE_LABELS.flashcard },
];

export function NoteFilters({
  filters,
  onFiltersChange,
  className,
}: NoteFiltersProps) {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = useCallback(
    <K extends keyof NotesFilters>(key: K, value: NotesFilters[K]) => {
      onFiltersChange({ ...filters, [key]: value, page: 1 });
    },
    [filters, onFiltersChange]
  );

  const clearFilters = useCallback(() => {
    onFiltersChange({ page: 1 });
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.search ||
    filters.school_id ||
    filters.grade ||
    filters.subject ||
    filters.visibility ||
    filters.mode;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main search row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("notes.searchPlaceholder")}
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value || undefined)}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 rounded-lg bg-muted/50">
          {/* School */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">{t("notes.fields.school")}</label>
            <SchoolSelector
              value={filters.school_id || null}
              onChange={(value) => updateFilter("school_id", value || undefined)}
            />
          </div>

          {/* Grade */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">{t("notes.fields.grade")}</label>
            <GradeSelector
              value={filters.grade || null}
              onChange={(value) => updateFilter("grade", value || undefined)}
            />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">{t("notes.fields.subject")}</label>
            <Input
              type="text"
              placeholder={t("notes.fields.subjectFilterPlaceholder")}
              value={filters.subject || ""}
              onChange={(e) => updateFilter("subject", e.target.value || undefined)}
            />
          </div>

          {/* Visibility */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">{t("notes.fields.visibility")}</label>
            <Select
              value={filters.visibility || "all"}
              onValueChange={(value) =>
                updateFilter(
                  "visibility",
                  value === "all" ? undefined : (value as NoteVisibility)
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("notes.filters.allVisibilities")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t("notes.filters.allVisibilities")}</SelectItem>
                  {VISIBILITIES.map((vis) => (
                    <SelectItem key={vis.value} value={vis.value}>
                      {vis.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">{t("notes.fields.type")}</label>
            <Select
              value={filters.mode || "all"}
              onValueChange={(value) =>
                updateFilter("mode", value === "all" ? undefined : (value as NoteMode))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("notes.filters.allTypes")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t("notes.filters.allTypes")}</SelectItem>
                  {MODES.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
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
                {t("notes.filters.clear")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
