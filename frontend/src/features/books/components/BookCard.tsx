"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Book, CONDITION_LABELS, STATUS_LABELS } from "@/types/book";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const { t } = useTranslation();
  const imageUrl = book.images.length > 0 ? book.images[0].url : null;

  return (
    <Link href={`/books/${book.id}`}>
      <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer overflow-hidden">
        {/* Image */}
        <div className="aspect-[4/3] bg-muted relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={book.title}
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full flex items-center justify-center">
              <BookOpen className="size-8 text-muted-foreground/50" />
            </div>
          )}
          {/* Status badge */}
          {book.status !== "available" && (
            <span
              className={cn(
                "absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-medium",
                book.status === "reserved" &&
                  "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
                book.status === "sold" &&
                  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                book.status === "hidden" &&
                  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              )}
            >
              {STATUS_LABELS[book.status]}
            </span>
          )}
          {/* Price badge */}
          <span className="absolute bottom-2 right-2 rounded-full bg-black/70 text-white px-2 py-0.5 text-sm font-semibold">
            &euro;{book.price.toFixed(2)}
          </span>
        </div>

        <CardContent className="pt-3 pb-4 space-y-1.5">
          {/* Title */}
          <h3 className="font-medium text-sm leading-snug line-clamp-2">
            {book.title}
          </h3>

          {/* Condition */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
              {CONDITION_LABELS[book.condition]}
            </span>
          </div>

          {/* School */}
          <p className="text-xs text-muted-foreground truncate">
            {book.school?.name}
          </p>

          {/* Grade & subject */}
          {(book.grade || book.subject) && (
            <p className="text-xs text-muted-foreground truncate">
              {[book.grade ? `${t("books.fields.grade")} ${book.grade}` : null, book.subject]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}