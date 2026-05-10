"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/Layouts";
import { PageHeader, EmptyState, LoadingState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { BookFilters, BookCard } from "@/features/books";
import { booksService } from "@/services/books";
import { BooksFilters, Book } from "@/types/book";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { Plus, Loader2 } from "lucide-react";

export default function BooksPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BooksFilters>({ status: "available" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const loadBooks = useCallback(async (page: number = 1, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await booksService.getBooks({
        ...filters,
        page,
        per_page: 20,
      });
      if (append) {
        setBooks((prev) => [...prev, ...response.data]);
      } else {
        setBooks(response.data);
      }
      setTotalPages(response.meta.last_page);
      setCurrentPage(response.meta.current_page);
    } catch {
      setError(t("books.loadError"));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters, t]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    const fetchBooks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await booksService.getBooks({
          ...filters,
          page: 1,
          per_page: 20,
        });
        if (!cancelled) {
          setBooks(response.data);
          setTotalPages(response.meta.last_page);
          setCurrentPage(response.meta.current_page);
        }
      } catch {
        if (!cancelled) {
          setError(t("books.loadError"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    
    fetchBooks();
    
    return () => {
      cancelled = true;
    };
  }, [filters, isAuthenticated, t]);

  const handleFiltersChange = useCallback(
    (newFilters: BooksFilters) => {
      setFilters(newFilters);
      setCurrentPage(1);
    },
    []
  );

  const handleLoadMore = useCallback(() => {
    if (currentPage < totalPages && !isLoadingMore) {
      loadBooks(currentPage + 1, true);
    }
  }, [currentPage, totalPages, isLoadingMore, loadBooks]);

  if (authLoading) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto">
          <LoadingState />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppLayout>
      <div className="p-4 max-w-2xl mx-auto space-y-6 pb-20 md:pb-4">
        <PageHeader
          title={t("books.title")}
          description={t("books.description")}
          actions={
            <Link href="/books/new">
              <Button size="sm">
                <Plus className="size-4" />
                {t("books.sellBook")}
              </Button>
            </Link>
          }
        />

        <BookFilters filters={filters} onFiltersChange={handleFiltersChange} />

        {isLoading && <LoadingState message={t("books.loadingBooks")} />}

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => loadBooks(1)} className="mt-3">
              {t("common.tryAgain")}
            </Button>
          </div>
        )}

        {!isLoading && !error && books.length === 0 && (
          <EmptyState
            title={t("books.noBooks")}
            description={t("books.noBooksDesc")}
            action={
              <Link href="/books/new">
                <Button size="sm">{t("books.sellBook")}</Button>
              </Link>
            }
          />
        )}

        {!isLoading && !error && books.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

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
                      {t("common.loading")}
                    </>
                  ) : (
                    t("common.loadMore")
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}