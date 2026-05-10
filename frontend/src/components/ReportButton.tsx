"use client";

import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { reportsService } from "@/services/reports";
import type { ReportableType } from "@/types/report";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface ReportButtonProps {
  reportableType: ReportableType;
  reportableId: number;
  label?: string;
  className?: string;
}

export function ReportButton({
  reportableType,
  reportableId,
  label,
  className,
}: ReportButtonProps) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t("reports.report");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError(t("reports.reasonRequired"));
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await reportsService.create({
        target_type: reportableType,
        target_id: reportableId,
        reason: reason.trim(),
      });
      setOpen(false);
      setReason("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("reports.reportError");
      if (message.includes("already reported")) {
        setError(t("reports.alreadyReported"));
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={cn("text-muted-foreground", className)}
          />
        }
      >
        <Flag className="size-3.5" />
        {resolvedLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("reports.confirmTitle")}</DialogTitle>
          <DialogDescription>
            {t("reports.confirmDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            placeholder={t("reports.reasonPlaceholder")}
            rows={4}
            maxLength={1000}
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {reason.length > 0 && (
            <p className="text-xs text-muted-foreground text-right">
              {reason.length}/1000
            </p>
          )}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isSubmitting} />}>
            {t("common.cancel")}
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                {t("reports.submitting")}
              </>
            ) : (
              t("reports.report")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
