"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Flashcard } from "@/types/flashcard";
import { cn } from "@/lib/utils";
import { RotateCcw, FileText } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface FlashcardCardProps {
  flashcard: Flashcard;
  onClick?: () => void;
  className?: string;
}

export function FlashcardCard({ flashcard, onClick, className }: FlashcardCardProps) {
  const { t } = useTranslation();
  return (
    <Card
      className={cn(
        "h-full hover:bg-muted/50 transition-colors cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="pt-4 pb-4 space-y-3">
        {/* Card number */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
            #{flashcard.position}
          </span>
          <FileText className="size-3.5 text-muted-foreground" />
        </div>

        {/* Front text */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">{t("flashcards.fields.front")}</p>
          <p className="text-sm font-medium line-clamp-3">{flashcard.front_text}</p>
        </div>

        {/* Back text */}
        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground mb-1">{t("flashcards.fields.back")}</p>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {flashcard.back_text}
          </p>
        </div>

        {/* Updated date */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
          <RotateCcw className="size-3" />
          <span>{t("flashcards.updated")} {new Date(flashcard.updated_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
