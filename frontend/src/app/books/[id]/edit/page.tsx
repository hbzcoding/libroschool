"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/Layouts";
import { PageHeader, LoadingState, EmptyState } from "@/components/States";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { booksService } from "@/services/books";
import { Book } from "@/types/book";
import { EditBookForm } from "@/features/books/EditBookForm";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const bookId = Number(params.id);

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) return;

    const fetchBook = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await booksService.getBook(bookId);
        setBook(response);
      } catch {
        setError("Failed to load book details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  // Check if user is owner
  if (!isLoading && book && user && book.seller.id !== user.id) {
    return (
      <AppLayout>
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
          <PageHeader title="Edit Book" />
          <EmptyState
            title="Access Denied"
            description="You can only edit your own book listings."
            action={
              <Link href={`/books/${bookId}`}>
                <Button variant="outline">View Book</Button>
              </Link>
            }
          />
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
          <LoadingState message="Loading book..." />
        </div>
      </AppLayout>
    );
  }

  if (error || !book) {
    return (
      <AppLayout>
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
          <PageHeader title="Edit Book" />
          <EmptyState
            title="Book Not Found"
            description={error || "This book does not exist or has been deleted."}
            action={
              <Link href="/books">
                <Button variant="outline">Back to Books</Button>
              </Link>
            }
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-2xl mx-auto pb-20 md:pb-4">
        <div className="mb-4">
          <Link href={`/books/${bookId}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to Book
            </Button>
          </Link>
        </div>

        <PageHeader title="Edit Book" description={book.title} />

        <Card>
          <CardContent className="p-6">
            <EditBookForm book={book} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}