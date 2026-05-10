"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/Layouts";
import { PageHeader, EmptyState, LoadingState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { RequestFilters, RequestCard } from "@/features/requests";
import { bookRequestsService } from "@/services/bookRequests";
import { BookRequestsFilters, BookRequest } from "@/types/bookRequest";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { Plus, Loader2 } from "lucide-react";

export default function RequestsPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BookRequestsFilters>({ status: "open" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const loadRequests = useCallback(async (page: number = 1, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await bookRequestsService.getRequests({
        ...filters,
        page,
        per_page: 20,
      });
      if (append) {
        setRequests((prev) => [...prev, ...response.data]);
      } else {
        setRequests(response.data);
      }
      setTotalPages(response.meta.last_page);
      setCurrentPage(response.meta.current_page);
    } catch {
      setError(t("requests.loadError"));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters, t]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    let cancelled = false;
    const fetchRequests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await bookRequestsService.getRequests({
          ...filters,
          page: 1,
          per_page: 20,
        });
        if (!cancelled) {
          setRequests(response.data);
          setTotalPages(response.meta.last_page);
          setCurrentPage(response.meta.current_page);
        }
      } catch {
        if (!cancelled) {
          setError(t("requests.loadError"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    
    fetchRequests();
    
    return () => {
      cancelled = true;
    };
  }, [filters, isAuthenticated, t]);

  const handleFiltersChange = useCallback(
    (newFilters: BookRequestsFilters) => {
      setFilters(newFilters);
      setCurrentPage(1);
    },
    []
  );

  const handleLoadMore = useCallback(() => {
    if (currentPage < totalPages && !isLoadingMore) {
      loadRequests(currentPage + 1, true);
    }
  }, [currentPage, totalPages, isLoadingMore, loadRequests]);

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
          title={t("requests.title")}
          description={t("requests.description")}
          actions={
            <Link href="/requests/new">
              <Button size="sm">
                <Plus className="size-4" />
                {t("requests.createRequest")}
              </Button>
            </Link>
          }
        />

        <RequestFilters filters={filters} onFiltersChange={handleFiltersChange} />

        {isLoading && <LoadingState message={t("requests.loadingRequests")} />}

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => loadRequests(1)} className="mt-3">
              {t("common.tryAgain")}
            </Button>
          </div>
        )}

        {!isLoading && !error && requests.length === 0 && (
          <EmptyState
            title={t("requests.noRequests")}
            description={t("requests.noRequestsDesc")}
            action={
              <Link href="/requests/new">
                <Button size="sm">{t("requests.createRequest")}</Button>
              </Link>
            }
          />
        )}

        {!isLoading && !error && requests.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
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
