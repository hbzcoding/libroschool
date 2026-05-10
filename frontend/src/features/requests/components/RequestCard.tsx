"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { BookRequest, REQUEST_STATUS_LABELS } from "@/types/bookRequest";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface RequestCardProps {
  request: BookRequest;
}

export function RequestCard({ request }: RequestCardProps) {
  const { t } = useTranslation();
  return (
    <Link href={`/requests/${request.id}`}>
      <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer overflow-hidden">
        {/* Header with status */}
        <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm leading-snug line-clamp-2 flex-1">
            {request.title}
          </h3>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
              request.status === "open" &&
                "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
              request.status === "matched" &&
                "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
              request.status === "closed" &&
                "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
              request.status === "hidden" &&
                "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            )}
          >
            {REQUEST_STATUS_LABELS[request.status]}
          </span>
        </div>

        <CardContent className="pt-0 pb-4 space-y-1.5">
          {/* Max price */}
          {request.max_price !== null && request.max_price > 0 && (
            <p className="text-sm font-semibold">
              {t("requests.upTo")} &euro;{request.max_price.toFixed(2)}
            </p>
          )}

          {/* Grade & subject */}
          {(request.grade || request.subject) && (
            <p className="text-xs text-muted-foreground truncate">
              {[request.grade ? `${t("requests.fields.grade")} ${request.grade}` : null, request.subject]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}

          {/* School */}
          <div className="flex items-center gap-1.5">
            <Search className="size-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground truncate">
              {request.school?.name}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
