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

interface TrackSelectorProps {
  value?: string | null;
  onChange: (track: string | null) => void;
  className?: string;
  placeholder?: string;
}

const TRACKS = [
  { value: "scientific", label: "Scientific (Scientifico)" },
  { value: "classical", label: "Classical (Classico)" },
  { value: "linguistic", label: "Linguistic (Linguistico)" },
  { value: "artistic", label: "Artistic (Artistico)" },
  { value: "technical", label: "Technical (Tecnico)" },
  { value: "professional", label: "Professional (Professionale)" },
];

export function TrackSelector({
  value,
  onChange,
  className,
  placeholder,
}: TrackSelectorProps) {
  const { t } = useTranslation();
  const defaultPlaceholder = t("selectors.selectTrack");
  const resolvedPlaceholder = placeholder ?? defaultPlaceholder;
  const handleSelect = (trackValue: string | null) => {
    if (trackValue === "none" || trackValue === null) {
      onChange(null);
    } else {
      onChange(trackValue);
    }
  };

  return (
    <Select value={value || ""} onValueChange={handleSelect}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={resolvedPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="none">{t("common.none")}</SelectItem>
          {TRACKS.map((track) => (
            <SelectItem key={track.value} value={track.value}>
              {track.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}