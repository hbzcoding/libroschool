"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SchoolSelector } from "@/components/SchoolSelector";
import { GradeSelector } from "@/components/GradeSelector";
import { TrackSelector } from "@/components/TrackSelector";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BooksFilters, BookCondition, BookStatus, CONDITION_LABELS, STATUS_LABELS } from "@/types/book";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface BookFiltersProps {
  filters: BooksFilters;
  onFiltersChange: (filters: BooksFilters) => void;
  className?: string;
}

const CONDITIONS: { value: BookCondition; label: string }[] = [
  { value: "new", label: CONDITION_LABELS.new },
  { value: "very_good", label: CONDITION_LABELS.very_good },
  { value: "good", label: CONDITION_LABELS.good },
  { value: "acceptable", label: CONDITION_LABELS.acceptable },
];

const STATUSES: { value: BookStatus; label: string }[] = [
  { value: "available", label: STATUS_LABELS.available },
  { value: "reserved", label: STATUS_LABELS.reserved },
  { value: "sold", label: STATUS_LABELS.sold },
];

export function BookFilters({
  filters,
  onFiltersChange,
  className,
}: BookFiltersProps) {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = useCallback(
    <K extends keyof BooksFilters>(key: K, value: BooksFilters[K]) => {
      onFiltersChange({ ...filters, [key]: value, page: 1 });
    },
    [filters, onFiltersChange]
  );

  const clearFilters = useCallback(() => {
    onFiltersChange({ status: "available", page: 1 });
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.search ||
    filters.school_id ||
    filters.grade ||
    filters.track ||
    filters.subject ||
    filters.isbn ||
    filters.min_price !== undefined ||
    filters.max_price !== undefined ||
    filters.condition ||
    filters.status;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main search row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("books.searchPlaceholder")}
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
            <label className="text-xs font-medium">{t("books.fields.school")}</label>
            <SchoolSelector
              value={filters.school_id || null}
              onChange={(value) => updateFilter("school_id", value || undefined)}
            />
          </div>

          {/* Grade */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">{t("books.fields.grade")}</label>
            <GradeSelector
              value={filters.grade || null}
              onChange={(value) => updateFilter("grade", value || undefined)}
            />
          </div>

          {/* Track */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">{t("books.fields.track")}</label>
            <TrackSelector
              value={filters.track || null}
              onChange={(value) => updateFilter("track", value || undefined)}
            />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">{t("books.fields.subject")}</label>
            <Input
              type="text"
              placeholder={t("books.fields.subjectFilterPlaceholder")}
              value={filters.subject || ""}
              onChange={(e) => updateFilter("subject", e.target.value || undefined)}
            />
          </div>

          {/* Condition */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">{t("books.fields.condition")}</label>
            <Select
              value={filters.condition || "all"}
              onValueChange={(value) =>
                updateFilter("condition", value === "all" ? undefined : (value as BookCondition))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("books.filters.allConditions")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t("books.filters.allConditions")}</SelectItem>
                  {CONDITIONS.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">{t("books.fields.status")}</label>
            <Select
              value={filters.status || "available"}
              onValueChange={(value) => {
                const statusValue = value as string;
                updateFilter("status", statusValue === "all" ? undefined : (statusValue as BookStatus));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("books.filters.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t("books.filters.allStatuses")}</SelectItem>
                  {STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Price range */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">{t("books.filters.priceRange")}</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder={t("books.filters.min")}
                min={0}
                step={0.5}
                value={filters.min_price ?? ""}
                onChange={(e) =>
                  updateFilter(
                    "min_price",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-20"
              />
              <span className="text-muted-foreground text-sm">{t("books.filters.to")}</span>
              <Input
                type="number"
                placeholder={t("books.filters.max")}
                min={0}
                step={0.5}
                value={filters.max_price ?? ""}
                onChange={(e) =>
                  updateFilter(
                    "max_price",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-20"
              />
            </div>
          </div>

          {/* ISBN */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">{t("books.fields.isbn")}</label>
            <Input
              type="text"
              placeholder={t("books.fields.isbnPlaceholder")}
              value={filters.isbn || ""}
              onChange={(e) => updateFilter("isbn", e.target.value || undefined)}
            />
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
                {t("books.filters.clear")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}