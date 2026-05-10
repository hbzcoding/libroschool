"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { classroomsService } from "@/services/classrooms";
import {
  ClassroomMember,
  MEMBER_ROLE_LABELS,
  MEMBER_STATUS_LABELS,
} from "@/types/classroom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, User as UserIcon, Crown, Shield, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberListProps {
  classroomId: number;
  currentUserRole?: "owner" | "moderator" | "member" | null;
}

export function MemberList({ classroomId, currentUserRole }: MemberListProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);

  const isOwner = currentUserRole === "owner";
  const isModerator = currentUserRole === "moderator";

  const loadMembers = useCallback(
    async (page: number = 1, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await classroomsService.getMembers(classroomId, {
          page,
          per_page: 20,
        });
        if (append) {
          setMembers((prev) => [...prev, ...response.data]);
        } else {
          setMembers(response.data);
        }
        setTotalPages(response.meta.last_page);
        setCurrentPage(response.meta.current_page);
      } catch {
        setError("Failed to load members.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [classroomId]
  );

  useEffect(() => {
    let cancelled = false;

    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await classroomsService.getMembers(classroomId, {
          page: 1,
          per_page: 20,
        });
        if (!cancelled) {
          setMembers(response.data);
          setTotalPages(response.meta.last_page);
          setCurrentPage(response.meta.current_page);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load members.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchMembers();

    return () => {
      cancelled = true;
    };
  }, [classroomId]);

  const handleLoadMore = useCallback(() => {
    if (currentPage < totalPages && !isLoadingMore) {
      loadMembers(currentPage + 1, true);
    }
  }, [currentPage, totalPages, isLoadingMore, loadMembers]);

  const handleRoleChange = async (memberId: number, newRole: "member" | "moderator") => {
    setUpdatingRoleId(memberId);
    try {
      await classroomsService.updateMemberRole(classroomId, memberId, { role: newRole });
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId ? { ...m, role: newRole } : m
        )
      );
    } catch {
      alert("Failed to update role.");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleRemoveMember = async () => {
    if (!removingMemberId) return;
    try {
      await classroomsService.removeMember(classroomId, removingMemberId);
      setMembers((prev) => prev.filter((m) => m.id !== removingMemberId));
    } catch {
      alert("Failed to remove member.");
    } finally {
      setShowRemoveDialog(false);
      setRemovingMemberId(null);
    }
  };

  const canManageMember = (member: ClassroomMember) => {
    // Owner can manage anyone except other owners
    // Moderator can manage members only (not other moderators or owners)
    if (member.role === "owner") return false;
    if (isOwner) return true;
    if (isModerator && member.role === "member") return true;
    return false;
  };

  const canChangeRole = (member: ClassroomMember) => {
    // Only owner can change roles, and not for owners
    return isOwner && member.role !== "owner";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadMembers(1)}
            className="mt-3"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <UserIcon className="size-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm font-medium">No members</p>
          <p className="text-xs text-muted-foreground mt-1">
            This classroom has no members yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {/* Role icon */}
                <div
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center",
                    member.role === "owner" && "bg-primary/10 text-primary",
                    member.role === "moderator" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
                    member.role === "member" && "bg-muted text-muted-foreground"
                  )}
                >
                  {member.role === "owner" && <Crown className="size-4" />}
                  {member.role === "moderator" && <Shield className="size-4" />}
                  {member.role === "member" && <UserIcon className="size-4" />}
                </div>

                {/* User info */}
                <div>
                  <p className="text-sm font-medium">{member.user.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={cn(
                        "text-xs",
                        member.role === "owner" && "text-primary",
                        member.role === "moderator" && "text-amber-600 dark:text-amber-400",
                        member.role === "member" && "text-muted-foreground"
                      )}
                    >
                      {MEMBER_ROLE_LABELS[member.role]}
                    </span>
                    {member.status !== "active" && (
                      <span className="text-xs text-muted-foreground">
                        ({MEMBER_STATUS_LABELS[member.status]})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {canManageMember(member) && user?.id !== member.user.id && (
                <div className="flex items-center gap-2">
                  {canChangeRole(member) && (
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        handleRoleChange(
                          member.id,
                          value as "member" | "moderator"
                        )
                      }
                      disabled={updatingRoleId === member.id}
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {isOwner && member.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setRemovingMemberId(member.id);
                        setShowRemoveDialog(true);
                      }}
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {currentPage < totalPages && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Remove confirmation dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Remove Member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove this member from the classroom?
            They will lose access to all classroom content.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
