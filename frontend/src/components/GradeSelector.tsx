"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface GradeSelectorProps {
  value?: number | null;
  onChange: (grade: number | null) => void;
  className?: string;
  placeholder?: string;
}

const GRADES = [
  { value: 1, label: "1st Year" },
  { value: 2, label: "2nd Year" },
  { value: 3, label: "3rd Year" },
  { value: 4, label: "4th Year" },
  { value: 5, label: "5th Year" },
];

export function GradeSelector({
  value,
  onChange,
  className,
  placeholder,
}: GradeSelectorProps) {
  const { t } = useTranslation();
  const defaultPlaceholder = t("selectors.selectGrade");
  const resolvedPlaceholder = placeholder ?? defaultPlaceholder;
  const handleSelect = (gradeValue: string | null) => {
    if (gradeValue === "none" || gradeValue === null) {
      onChange(null);
    } else {
      onChange(parseInt(gradeValue, 10));
    }
  };

  return (
    <Select
      value={value?.toString() || ""}
      onValueChange={handleSelect}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={resolvedPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="none">{t("common.none")}</SelectItem>
          {GRADES.map((grade) => (
            <SelectItem key={grade.value} value={grade.value.toString()}>
              {grade.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}