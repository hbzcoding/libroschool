"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/Layouts";
import { LoadingState, EmptyState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { classroomsService } from "@/services/classrooms";
import {
  Classroom,
  ClassroomMember,
  JOIN_POLICY_LABELS,
  VISIBILITY_LABELS,
  CLASSROOM_STATUS_LABELS,
} from "@/types/classroom";
import { useAuth } from "@/hooks/useAuth";
import { MemberList } from "@/features/classrooms";
import {
  ArrowLeft,
  GraduationCap,
  Users,
  School,
  Calendar,
  Copy,
  RefreshCw,
  LogOut,
  Flag,
  Loader2,
  Settings,
  Shield,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form";

export default function ClassroomDetailPage() {
  const router = useRouter();
  const params = useParams();
  const classroomId = parseInt(params.id as string, 10);
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [currentUserMember, setCurrentUserMember] =
    useState<ClassroomMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showJoinCodeDialog, setShowJoinCodeDialog] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinCodeError, setJoinCodeError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load classroom data
  useEffect(() => {
    if (!isAuthenticated || !classroomId || isNaN(classroomId)) return;

    let cancelled = false;

    const fetchClassroom = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await classroomsService.getClassroom(classroomId);
        if (!cancelled) {
          setClassroom(response);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load classroom. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchClassroom();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, classroomId]);

  // Check current user's membership
  useEffect(() => {
    if (!classroom || !user) return;

    const checkMembership = async () => {
      try {
        const membersResponse = await classroomsService.getMembers(classroomId, {
          per_page: 100,
        });
        const currentUser = membersResponse.data.find(
          (m) => m.user.id === user.id
        );
        setCurrentUserMember(currentUser || null);
      } catch {
        // Non-members may not be able to fetch members
        setCurrentUserMember(null);
      }
    };

    checkMembership();
  }, [classroom, user, classroomId]);

  const isOwner = currentUserMember?.role === "owner";
  const isModerator = currentUserMember?.role === "moderator";
  const isMember = !!currentUserMember;
  const canManageSettings = isOwner;
  const canSeeJoinCode = isOwner || isModerator;

  const handleCopyJoinCode = async () => {
    if (classroom?.join_code) {
      await navigator.clipboard.writeText(classroom.join_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleRegenerateJoinCode = async () => {
    if (!classroom) return;
    setIsUpdating(true);
    try {
      const updated = await classroomsService.regenerateJoinCode(classroom.id);
      setClassroom(updated);
    } catch {
      alert("Failed to regenerate join code.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLeave = async () => {
    if (!classroom) return;
    setIsUpdating(true);
    try {
      await classroomsService.leaveClassroom(classroom.id);
      router.push("/classes");
    } catch {
      alert("Failed to leave classroom.");
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!classroom) return;
    setIsUpdating(true);
    try {
      await classroomsService.deleteClassroom(classroom.id);
      router.push("/classes");
    } catch {
      alert("Failed to delete classroom.");
      setIsUpdating(false);
    }
  };

  const handleJoin = async () => {
    if (!classroom) return;
    if (classroom.join_policy === "code") {
      setShowJoinCodeDialog(true);
    } else if (classroom.join_policy === "open") {
      setIsJoining(true);
      try {
        await classroomsService.joinClassroom(classroom.id);
        router.refresh();
      } catch {
        alert("Failed to join classroom.");
      } finally {
        setIsJoining(false);
      }
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCodeInput.trim()) {
      setJoinCodeError("Please enter a join code.");
      return;
    }
    setIsJoining(true);
    setJoinCodeError(null);
    try {
      const result = await classroomsService.joinByCode(joinCodeInput.toUpperCase());
      if (result.id === classroomId) {
        setShowJoinCodeDialog(false);
        router.refresh();
      } else {
        // Joined a different classroom
        router.push(`/classes/${result.id}`);
      }
    } catch {
      setJoinCodeError("Invalid join code.");
    } finally {
      setIsJoining(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto">
          <LoadingState message="Loading classroom..." />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error || !classroom) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto">
          <EmptyState
            title="Classroom not found"
            description={error || "This classroom may have been removed."}
            action={
              <Link href="/classes">
                <Button size="sm">Browse Classrooms</Button>
              </Link>
            }
          />
        </div>
      </AppLayout>
    );
  }

  const isLocked = classroom.status === "locked";
  const isArchived = classroom.status === "archived";

  return (
    <AppLayout>
      <div className="p-4 max-w-2xl mx-auto space-y-6 pb-20 md:pb-4">
        {/* Back link */}
        <Link
          href="/classes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Classrooms
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold leading-snug">{classroom.name}</h1>
            <div className="flex items-center gap-2 mt-2">
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
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  classroom.visibility === "public"
                    ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                )}
              >
                {VISIBILITY_LABELS[classroom.visibility]}
              </span>
              {classroom.status !== "active" && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    classroom.status === "locked" &&
                      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
                    classroom.status === "archived" &&
                      "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  )}
                >
                  {CLASSROOM_STATUS_LABELS[classroom.status]}
                </span>
              )}
            </div>
          </div>
          {canManageSettings && (
            <Link href={`/classes/${classroom.id}/edit`}>
              <Button variant="outline" size="sm">
                <Settings className="size-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Info card */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* School */}
              <div className="flex items-start gap-2">
                <School className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">School</p>
                  <p className="text-sm font-medium">{classroom.school?.name}</p>
                  {classroom.school?.city && (
                    <p className="text-xs text-muted-foreground">
                      {classroom.school.city}
                    </p>
                  )}
                </div>
              </div>

              {/* Grade */}
              <div className="flex items-start gap-2">
                <GraduationCap className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Grade</p>
                  <p className="text-sm font-medium">
                    {classroom.grade}
                    {classroom.section && ` - Section ${classroom.section}`}
                  </p>
                </div>
              </div>

              {/* Track */}
              {classroom.track && (
                <div className="flex items-start gap-2">
                  <Shield className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Track</p>
                    <p className="text-sm font-medium capitalize">
                      {classroom.track}
                    </p>
                  </div>
                </div>
              )}

              {/* Academic Year */}
              <div className="flex items-start gap-2">
                <Calendar className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Academic Year</p>
                  <p className="text-sm font-medium">{classroom.academic_year}</p>
                </div>
              </div>

              {/* Member count */}
              <div className="flex items-start gap-2">
                <Users className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Members</p>
                  <p className="text-sm font-medium">{classroom.members_count}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {classroom.description && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {classroom.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Join code (for owner/moderator) */}
        {canSeeJoinCode && classroom.join_code && (
          <Card className="border-dashed">
            <CardContent className="pt-4 pb-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Join Code
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded-lg text-lg font-mono tracking-wider">
                  {classroom.join_code}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyJoinCode}
                >
                  {copiedCode ? (
                    "Copied!"
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerateJoinCode}
                  disabled={isUpdating}
                  className="text-muted-foreground"
                >
                  <RefreshCw className="size-3.5 mr-1" />
                  Regenerate Code
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Owner actions */}
        {isOwner && (
          <Card className="border-dashed">
            <CardContent className="pt-4 pb-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Owner Actions
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href={`/classes/${classroom.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit Settings
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isUpdating}
                >
                  Delete Classroom
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Member actions */}
        {isMember && !isOwner && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setShowLeaveDialog(true)}
            >
              <LogOut className="size-3.5" />
              Leave Classroom
            </Button>
          </div>
        )}

        {/* Non-member actions */}
        {!isMember && classroom.status === "active" && (
          <Card className="border-dashed">
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground mb-3">
                You are not a member of this classroom.
              </p>
              {classroom.join_policy === "open" && (
                <Button onClick={handleJoin} disabled={isJoining}>
                  {isJoining ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Users className="size-4" />
                      Join Classroom
                    </>
                  )}
                </Button>
              )}
              {classroom.join_policy === "code" && (
                <Button
                  onClick={() => setShowJoinCodeDialog(true)}
                  disabled={isJoining}
                >
                  <Lock className="size-4" />
                  Enter Join Code
                </Button>
              )}
              {classroom.join_policy === "approval" && (
                <Button disabled>
                  Request to Join
                  <span className="text-xs ml-2">(Coming Soon)</span>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Locked/Archived notice */}
        {(isLocked || isArchived) && (
          <Card className="border-dashed bg-muted/50">
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">
                {isLocked &&
                  "This classroom is locked. You cannot join or post new content."}
                {isArchived &&
                  "This classroom has been archived and is no longer active."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Members list */}
        {isMember && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Members</h2>
            <MemberList
              classroomId={classroom.id}
              currentUserRole={currentUserMember?.role}
            />
          </div>
        )}

        {/* Report button */}
        {!isOwner && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                alert("Report functionality coming soon!");
              }}
            >
              <Flag className="size-3.5" />
              Report Classroom
            </Button>
          </div>
        )}

        {/* Delete confirmation dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogTitle>Delete Classroom</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this classroom? All members will
              lose access and this action cannot be undone.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Leave confirmation dialog */}
        <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
          <AlertDialogContent>
            <AlertDialogTitle>Leave Classroom</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this classroom? You will lose
              access to all classroom content.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeave}>
                Leave
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Join by code dialog */}
        <Dialog open={showJoinCodeDialog} onOpenChange={setShowJoinCodeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Join Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="join-code" className="text-sm font-medium">
                  Join Code
                </label>
                <Input
                  id="join-code"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  className="uppercase"
                  maxLength={20}
                />
                {joinCodeError && (
                  <FormMessage>{joinCodeError}</FormMessage>
                )}
              </div>
              <Button
                onClick={handleJoinByCode}
                disabled={isJoining || !joinCodeInput.trim()}
                className="w-full"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Joining...
                  </>
                ) : (
                  "Join Classroom"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
