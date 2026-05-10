"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SchoolSelector } from "@/components/SchoolSelector";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookRequestsFilters, BookRequestStatus, REQUEST_STATUS_LABELS } from "@/types/bookRequest";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RequestFiltersProps {
  filters: BookRequestsFilters;
  onFiltersChange: (filters: BookRequestsFilters) => void;
  className?: string;
}

const STATUSES: { value: BookRequestStatus; label: string }[] = [
  { value: "open", label: REQUEST_STATUS_LABELS.open },
  { value: "matched", label: REQUEST_STATUS_LABELS.matched },
  { value: "closed", label: REQUEST_STATUS_LABELS.closed },
];

export function RequestFilters({
  filters,
  onFiltersChange,
  className,
}: RequestFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = useCallback(
    <K extends keyof BookRequestsFilters>(key: K, value: BookRequestsFilters[K]) => {
      onFiltersChange({ ...filters, [key]: value, page: 1 });
    },
    [filters, onFiltersChange]
  );

  const clearFilters = useCallback(() => {
    onFiltersChange({ status: "open", page: 1 });
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.search ||
    filters.school_id ||
    filters.grade ||
    filters.track ||
    filters.subject ||
    filters.isbn ||
    filters.max_price !== undefined ||
    filters.status;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main search row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title, ISBN, subject..."
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
            <label className="text-xs font-medium">School</label>
            <SchoolSelector
              value={filters.school_id || null}
              onChange={(value) => updateFilter("school_id", value || undefined)}
            />
          </div>

          {/* Max Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Max Budget (&euro;)</label>
            <Input
              type="number"
              placeholder="e.g., 20"
              min={0}
              step={0.5}
              value={filters.max_price ?? ""}
              onChange={(e) =>
                updateFilter(
                  "max_price",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Status</label>
            <Select
              value={filters.status || "open"}
              onValueChange={(value) => {
                const statusValue = value as string;
                updateFilter("status", statusValue === "all" ? undefined : (statusValue as BookRequestStatus));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Subject</label>
            <Input
              type="text"
              placeholder="e.g., Math, History..."
              value={filters.subject || ""}
              onChange={(e) => updateFilter("subject", e.target.value || undefined)}
            />
          </div>

          {/* ISBN */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">ISBN</label>
            <Input
              type="text"
              placeholder="ISBN-10 or ISBN-13"
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
                Clear filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
