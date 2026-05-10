"use client";

import { useState, useEffect, useCallback } from "react";
import { schoolsService } from "@/services/schools";
import { School } from "@/types/school";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface SchoolSelectorProps {
  value?: number | null;
  onChange: (schoolId: number | null) => void;
  className?: string;
  placeholder?: string;
}

export function SchoolSelector({
  value,
  onChange,
  className,
  placeholder,
}: SchoolSelectorProps) {
  const { t } = useTranslation();
  const defaultPlaceholder = t("selectors.searchSchool");
  const resolvedPlaceholder = placeholder ?? defaultPlaceholder;
  const [search, setSearch] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Load selected school if value is provided
  useEffect(() => {
    if (value && !selectedSchool) {
      schoolsService
        .getSchool(value)
        .then((school) => setSelectedSchool(school))
        .catch(() => setSelectedSchool(null));
    }
  }, [value, selectedSchool]);

  // Search schools with debounce
  const searchSchools = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSchools([]);
      return;
    }
    setLoading(true);
    try {
      const response = await schoolsService.getSchools({
        search: searchQuery,
        per_page: 20,
      });
      setSchools(response.data);
    } catch {
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchSchools(search);
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, searchSchools]);

  const handlePick = (school: School) => {
    setSelectedSchool(school);
    setSearch("");
    onChange(school.id);
  };

  const handleClear = () => {
    setSelectedSchool(null);
    setSearch("");
    onChange(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Input
        type="text"
        placeholder={
          selectedSchool
            ? `${selectedSchool.name} - ${selectedSchool.city}`
            : resolvedPlaceholder
        }
        value={selectedSchool ? "" : search}
        onChange={(e) => {
          if (selectedSchool) {
            handleClear();
          }
          setSearch(e.target.value);
        }}
        disabled={loading}
      />
      {selectedSchool && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted text-sm">
          <span>
            {selectedSchool.name} - {selectedSchool.city}
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            {t("selectors.change")}
          </button>
        </div>
      )}
      {search.length >= 2 && schools.length > 0 && !selectedSchool && (
        <div className="border rounded-lg max-h-48 overflow-y-auto">
          {schools.map((school) => (
            <button
              key={school.id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
              onClick={() => handlePick(school)}
            >
              <span className="font-medium">{school.name}</span>
              <span className="text-muted-foreground"> - {school.city}</span>
            </button>
          ))}
        </div>
      )}
      {loading && (
        <p className="text-sm text-muted-foreground">{t("selectors.searching")}</p>
      )}
      {search.length >= 2 && !loading && schools.length === 0 && !selectedSchool && (
        <p className="text-sm text-muted-foreground">{t("selectors.noSchoolsFound")}</p>
      )}
    </div>
  );
}