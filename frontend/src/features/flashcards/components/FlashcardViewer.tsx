"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flashcard } from "@/types/flashcard";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  Layers,
} from "lucide-react";

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onEdit?: (flashcard: Flashcard) => void;
  onDelete?: (flashcard: Flashcard) => void;
  isAuthor?: boolean;
}

function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function FlashcardViewer({
  flashcards,
  onEdit,
  onDelete,
  isAuthor = false,
}: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);

  // All hooks must be at top - no early return before hooks
  const handlePrevious = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => {
      const cards = isShuffled ? shuffledCards : flashcards;
      return prev === 0 ? cards.length - 1 : prev - 1;
    });
  }, [isShuffled, shuffledCards, flashcards]);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => {
      const cards = isShuffled ? shuffledCards : flashcards;
      return prev === cards.length - 1 ? 0 : prev + 1;
    });
  }, [isShuffled, shuffledCards, flashcards]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleShuffleToggle = useCallback(() => {
    if (!isShuffled) {
      // Enable shuffle: compute shuffled array in event handler
      setShuffledCards(shuffleArray(flashcards));
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsShuffled(true);
    } else {
      // Disable shuffle
      setShuffledCards([]);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsShuffled(false);
    }
  }, [isShuffled, flashcards]);

  const handleReshuffle = useCallback(() => {
    setShuffledCards(shuffleArray(flashcards));
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [flashcards]);

  const handleReset = useCallback(() => {
    setIsShuffled(false);
    setShuffledCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  // Now we can do early return after all hooks
  if (flashcards.length === 0) {
    return null;
  }

  const currentCards = isShuffled ? shuffledCards : flashcards;
  const currentCard = currentCards[currentIndex];

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Layers className="size-4" />
          <span>
            Card {currentIndex + 1} of {flashcards.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={isShuffled ? handleReshuffle : handleShuffleToggle}
            className={cn(isShuffled && "text-primary")}
          >
            <Shuffle className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
          }}
        />
      </div>

      {/* Flip card */}
      <div
        className="perspective-1000 cursor-pointer"
        onClick={handleFlip}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleFlip();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? "Show front side" : "Show back side"}
      >
        <Card
          className={cn(
            "relative min-h-[280px] md:min-h-[320px] transition-transform duration-500 transform-style-preserve-3d",
            isFlipped && "rotate-y-180"
          )}
        >
          {/* Front side */}
          <CardContent
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center p-6 backface-hidden",
              isFlipped && "invisible"
            )}
          >
            <p className="text-xs text-muted-foreground mb-2">Front</p>
            <p className="text-lg md:text-xl font-medium text-center leading-relaxed">
              {currentCard.front_text}
            </p>
            <p className="text-xs text-muted-foreground mt-4">Tap to flip</p>
          </CardContent>

          {/* Back side */}
          <CardContent
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center p-6 backface-hidden rotate-y-180",
              !isFlipped && "invisible"
            )}
          >
            <p className="text-xs text-muted-foreground mb-2">Back</p>
            <p className="text-base md:text-lg text-center leading-relaxed text-muted-foreground">
              {currentCard.back_text}
            </p>
            <p className="text-xs text-muted-foreground mt-4">Tap to flip back</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="lg" onClick={handlePrevious}>
          <ChevronLeft className="size-5" />
          Previous
        </Button>
        <Button variant="outline" size="lg" onClick={handleNext}>
          Next
          <ChevronRight className="size-5" />
        </Button>
      </div>

      {/* Author actions */}
      {isAuthor && currentCard && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(currentCard)}
          >
            Edit Card
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete?.(currentCard)}
          >
            Delete Card
          </Button>
        </div>
      )}
    </div>
  );
}