"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/Layouts";
import { LoadingState, EmptyState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { booksService } from "@/services/books";
import { Book, CONDITION_LABELS, STATUS_LABELS } from "@/types/book";
import { useAuth } from "@/hooks/useAuth";
import { ReportButton } from "@/components/ReportButton";
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  User,
  Calendar,
  Tag,
  Hash,
  GraduationCap,
  Building2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Loader2,
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

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = parseInt(params.id as string, 10);
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !bookId || isNaN(bookId)) return;
    
    let cancelled = false;
    
    const fetchBook = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await booksService.getBook(bookId);
        if (!cancelled) {
          setBook(response);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load book. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    
    fetchBook();
    
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, bookId]);

  const isOwner = book && user && book.seller.id === user.id;

  const handleMarkReserved = async () => {
    if (!book) return;
    setIsUpdating(true);
    try {
      const updated = await booksService.markReserved(book.id);
      setBook(updated);
    } catch {
      alert("Failed to mark as reserved.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkSold = async () => {
    if (!book) return;
    setIsUpdating(true);
    try {
      const updated = await booksService.markSold(book.id);
      setBook(updated);
    } catch {
      alert("Failed to mark as sold.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!book) return;
    setIsUpdating(true);
    try {
      await booksService.deleteBook(book.id);
      router.push("/books");
    } catch {
      alert("Failed to delete book.");
      setIsUpdating(false);
    }
  };

  const nextImage = () => {
    if (book && book.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === book.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (book && book.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? book.images.length - 1 : prev - 1
      );
    }
  };

  if (authLoading || isLoading) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto">
          <LoadingState message="Loading book..." />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error || !book) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto">
          <EmptyState
            title="Book not found"
            description={error || "This book may have been removed."}
            action={
              <Link href="/books">
                <Button size="sm">Browse Books</Button>
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
          href="/books"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Books
        </Link>

        {/* Image gallery */}
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
          {book.images.length > 0 ? (
            <>
              <img
                src={book.images[currentImageIndex]?.url}
                alt={book.title}
                className="size-full object-cover"
              />
              {book.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {book.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                          "size-2 rounded-full transition-colors",
                          index === currentImageIndex
                            ? "bg-white"
                            : "bg-white/50 hover:bg-white/80"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="size-full flex items-center justify-center">
              <ImageIcon className="size-12 text-muted-foreground/50" />
            </div>
          )}

          {/* Status badge */}
          {book.status !== "available" && (
            <span
              className={cn(
                "absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-medium",
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
          <span className="absolute bottom-3 right-3 rounded-full bg-black/70 text-white px-3 py-1 text-lg font-semibold">
            &euro;{book.price.toFixed(2)}
          </span>
        </div>

        {/* Title and condition */}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold leading-snug">{book.title}</h1>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
              {CONDITION_LABELS[book.condition]}
            </span>
          </div>
        </div>

        {/* Seller actions */}
        {isOwner && (
          <Card className="border-dashed">
            <CardContent className="pt-4 pb-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Seller Actions
              </p>
              <div className="flex flex-wrap gap-2">
                {book.status === "available" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkReserved}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Mark Reserved"
                    )}
                  </Button>
                )}
                {book.status === "reserved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkSold}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Mark Sold"
                    )}
                  </Button>
                )}
                <Link href={`/books/${book.id}/edit`}>
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
              {book.isbn && (
                <div className="flex items-start gap-2">
                  <Hash className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">ISBN</p>
                    <p className="text-sm font-medium">{book.isbn}</p>
                  </div>
                </div>
              )}

              {/* Subject */}
              {book.subject && (
                <div className="flex items-start gap-2">
                  <Tag className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Subject</p>
                    <p className="text-sm font-medium">{book.subject}</p>
                  </div>
                </div>
              )}

              {/* Grade */}
              {book.grade && (
                <div className="flex items-start gap-2">
                  <GraduationCap className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Grade</p>
                    <p className="text-sm font-medium">{book.grade}</p>
                  </div>
                </div>
              )}

              {/* Track */}
              {book.track && (
                <div className="flex items-start gap-2">
                  <BookOpen className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Track</p>
                    <p className="text-sm font-medium capitalize">{book.track}</p>
                  </div>
                </div>
              )}

              {/* Publisher */}
              {book.publisher && (
                <div className="flex items-start gap-2">
                  <Building2 className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Publisher</p>
                    <p className="text-sm font-medium">{book.publisher}</p>
                  </div>
                </div>
              )}

              {/* Author */}
              {book.author && (
                <div className="flex items-start gap-2">
                  <User className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Author</p>
                    <p className="text-sm font-medium">{book.author}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {book.description && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {book.description}
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
                  {book.school?.name}
                  {book.school?.city && ` - ${book.school.city}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seller info */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Seller</p>
                  <p className="text-sm font-medium">{book.seller?.name}</p>
                </div>
              </div>
              {!isOwner && (
                <Link href={`/messages?new=true&book_id=${book.id}`}>
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
          <span>Listed {new Date(book.created_at).toLocaleDateString()}</span>
        </div>

        {/* Report button */}
        {!isOwner && (
          <div className="pt-2">
            <ReportButton
              reportableType="Book"
              reportableId={book.id}
              label="Report Book"
            />
          </div>
        )}

        {/* Delete confirmation dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this book listing? This action
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