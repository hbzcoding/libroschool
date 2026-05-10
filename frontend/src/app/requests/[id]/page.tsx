"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/Layouts";
import { LoadingState, EmptyState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { bookRequestsService } from "@/services/bookRequests";
import { BookRequest, REQUEST_STATUS_LABELS } from "@/types/bookRequest";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  User,
  Calendar,
  Tag,
  Hash,
  GraduationCap,
  Flag,
  MessageCircle,
  Loader2,
  CheckCircle2,
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

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = parseInt(params.id as string, 10);
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [request, setRequest] = useState<BookRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !requestId || isNaN(requestId)) return;
    
    let cancelled = false;
    
    const fetchRequest = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await bookRequestsService.getRequest(requestId);
        if (!cancelled) {
          setRequest(response);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load request. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    
    fetchRequest();
    
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, requestId]);

  const isOwner = request && user && request.buyer.id === user.id;

  const handleClose = async () => {
    if (!request) return;
    setIsUpdating(true);
    try {
      const updated = await bookRequestsService.closeRequest(request.id);
      setRequest(updated);
      setShowCloseDialog(false);
    } catch {
      alert("Failed to close request.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!request) return;
    setIsUpdating(true);
    try {
      await bookRequestsService.deleteRequest(request.id);
      router.push("/requests");
    } catch {
      alert("Failed to delete request.");
      setIsUpdating(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto">
          <LoadingState message="Loading request..." />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error || !request) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto">
          <EmptyState
            title="Request not found"
            description={error || "This request may have been removed."}
            action={
              <Link href="/requests">
                <Button size="sm">Browse Requests</Button>
              </Link>
            }
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 max-w-2xl mx-auto space-y-6 pb-20 md:pb-4">
        {/* Back link */}
        <Link
          href="/requests"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Requests
        </Link>

        {/* Title and status */}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold leading-snug">{request.title}</h1>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
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
        </div>

        {/* Budget */}
        {request.max_price !== null && request.max_price > 0 && (
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="text-lg font-semibold">
                Up to &euro;{request.max_price.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Buyer actions */}
        {isOwner && request.status !== "closed" && (
          <Card className="border-dashed">
            <CardContent className="pt-4 pb-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Buyer Actions
              </p>
              <div className="flex flex-wrap gap-2">
                {request.status === "open" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCloseDialog(true)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="size-4" />
                        Mark Closed
                      </>
                    )}
                  </Button>
                )}
                <Link href={`/requests/${request.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isUpdating}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Details card */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* ISBN */}
              {request.isbn && (
                <div className="flex items-start gap-2">
                  <Hash className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">ISBN</p>
                    <p className="text-sm font-medium">{request.isbn}</p>
                  </div>
                </div>
              )}

              {/* Subject */}
              {request.subject && (
                <div className="flex items-start gap-2">
                  <Tag className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Subject</p>
                    <p className="text-sm font-medium">{request.subject}</p>
                  </div>
                </div>
              )}

              {/* Grade */}
              {request.grade && (
                <div className="flex items-start gap-2">
                  <GraduationCap className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Grade</p>
                    <p className="text-sm font-medium">{request.grade}</p>
                  </div>
                </div>
              )}

              {/* Track */}
              {request.track && (
                <div className="flex items-start gap-2">
                  <BookOpen className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Track</p>
                    <p className="text-sm font-medium capitalize">{request.track}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {request.description && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {request.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* School */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">School</p>
                <p className="text-sm font-medium">
                  {request.school?.name}
                  {request.school?.city && ` - ${request.school.city}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buyer info */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Buyer</p>
                  <p className="text-sm font-medium">{request.buyer?.name}</p>
                </div>
              </div>
              {!isOwner && (
                <Link href={`/messages?new=true&book_request_id=${request.id}`}>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="size-4" />
                    Contact
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="size-3" />
          <span>Posted {new Date(request.created_at).toLocaleDateString()}</span>
        </div>

        {/* Report button */}
        {!isOwner && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                // Placeholder - actual report functionality will be implemented later
                alert("Report functionality coming soon!");
              }}
            >
              <Flag className="size-3.5" />
              Report Request
            </Button>
          </div>
        )}

        {/* Close confirmation dialog */}
        <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
          <AlertDialogContent>
            <AlertDialogTitle>Mark Request as Closed</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this book request? This marks the request as fulfilled and it will no longer appear in open requests.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClose}>
                Mark Closed
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete confirmation dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogTitle>Delete Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this book request? This action
              cannot be undone.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}