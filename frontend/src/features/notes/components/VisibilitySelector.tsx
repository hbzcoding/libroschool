"use client";

import { cn } from "@/lib/utils";
import {
  NoteVisibility,
  VISIBILITY_LABELS,
  VISIBILITY_DESCRIPTIONS,
} from "@/types/note";
import { Lock, Users, Globe, UserCheck } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface VisibilitySelectorProps {
  value: NoteVisibility;
  onChange: (value: NoteVisibility) => void;
  classroomName?: string | null;
  disabled?: boolean;
}

const VISIBILITY_OPTIONS: {
  value: NoteVisibility;
  label: string;
  description: string;
  icon: typeof Lock;
}[] = [
  {
    value: "private",
    label: VISIBILITY_LABELS.private,
    description: VISIBILITY_DESCRIPTIONS.private,
    icon: Lock,
  },
  {
    value: "classroom",
    label: VISIBILITY_LABELS.classroom,
    description: VISIBILITY_DESCRIPTIONS.classroom,
    icon: Users,
  },
  {
    value: "public",
    label: VISIBILITY_LABELS.public,
    description: VISIBILITY_DESCRIPTIONS.public,
    icon: Globe,
  },
  {
    value: "specific_users",
    label: VISIBILITY_LABELS.specific_users,
    description: VISIBILITY_DESCRIPTIONS.specific_users,
    icon: UserCheck,
  },
];

export function VisibilitySelector({
  value,
  onChange,
  classroomName,
  disabled = false,
}: VisibilitySelectorProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {t("notes.fields.visibility")} <span className="text-destructive">*</span>
      </label>
      <div className="grid grid-cols-2 gap-2">
        {VISIBILITY_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:bg-muted/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-1.5">
                <Icon className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{option.label}</span>
              </div>
              <span className="text-xs text-muted-foreground leading-tight">
                {option.value === "classroom" && classroomName
                  ? classroomName
                  : option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
