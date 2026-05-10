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
import { useTranslation } from "@/hooks/useTranslation";
import { ArrowLeft } from "lucide-react";

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
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
          <PageHeader title={t("books.editBookTitle")} />
          <EmptyState
            title={t("common.accessDenied")}
            description={t("books.editOwnOnly")}
            action={
              <Link href={`/books/${bookId}`}>
                <Button variant="outline">{t("books.viewBook")}</Button>
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
          <LoadingState message={t("books.loadingBooks")} />
        </div>
      </AppLayout>
    );
  }

  if (error || !book) {
    return (
      <AppLayout>
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
          <PageHeader title={t("books.editBookTitle")} />
          <EmptyState
            title={t("books.notFound")}
            description={error || t("books.notFoundDesc")}
            action={
              <Link href="/books">
                <Button variant="outline">{t("common.backToBooks")}</Button>
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
              {t("common.backToBook")}
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