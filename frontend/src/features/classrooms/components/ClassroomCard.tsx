"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Classroom, JOIN_POLICY_LABELS, CLASSROOM_STATUS_LABELS } from "@/types/classroom";
import { cn } from "@/lib/utils";
import { Users, GraduationCap } from "lucide-react";

interface ClassroomCardProps {
  classroom: Classroom;
}

export function ClassroomCard({ classroom }: ClassroomCardProps) {
  const isLocked = classroom.status === "locked";
  const isArchived = classroom.status === "archived";

  return (
    <Link href={`/classes/${classroom.id}`}>
      <Card
        className={cn(
          "h-full hover:bg-muted/50 transition-colors cursor-pointer",
          isLocked && "opacity-70",
          isArchived && "opacity-50"
        )}
      >
        <CardContent className="pt-4 pb-4 space-y-3">
          {/* Name and status */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm leading-snug line-clamp-2">
              {classroom.name}
            </h3>
            {classroom.status !== "active" && (
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                  classroom.status === "locked" &&
                    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
                  classroom.status === "archived" &&
                    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                )}
              >
                {CLASSROOM_STATUS_LABELS[classroom.status]}
              </span>
            )}
          </div>

          {/* School */}
          <p className="text-xs text-muted-foreground truncate">
            {classroom.school?.name}
          </p>

          {/* Grade, section, track */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <GraduationCap className="size-3" />
            <span>
              Grade {classroom.grade}
              {classroom.section && ` - Section ${classroom.section}`}
              {classroom.track && ` · ${classroom.track}`}
            </span>
          </div>

          {/* Academic year */}
          <p className="text-xs text-muted-foreground">
            {classroom.academic_year}
          </p>

          {/* Member count and join policy */}
          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="size-3" />
              {classroom.members_count}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                classroom.join_policy === "open" &&
                  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                classroom.join_policy === "code" &&
                  "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                classroom.join_policy === "approval" &&
                  "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
              )}
            >
              {JOIN_POLICY_LABELS[classroom.join_policy]}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
