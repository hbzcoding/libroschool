"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/Layouts";
import { PageHeader, EmptyState, LoadingState } from "@/components/States";
import { ConversationList } from "@/features/messages";
import { conversationsService } from "@/services/conversations";
import { Conversation } from "@/types/conversation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function MessagesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const creatingAttempted = useRef(false);

  const newParam = searchParams.get("new");
  const recipientId = searchParams.get("recipient_id");
  const bookId = searchParams.get("book_id");
  const bookRequestId = searchParams.get("book_request_id");

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Create conversation if query params indicate new conversation
  const createConversationFromParams = useCallback(async () => {
    if (!recipientId || creatingAttempted.current) return;

    creatingAttempted.current = true;
    setIsCreating(true);
    setError(null);

    try {
      const data: {
        recipient_id: number;
        book_id?: number;
        book_request_id?: number;
      } = {
        recipient_id: Number(recipientId),
      };

      if (bookId) data.book_id = Number(bookId);
      if (bookRequestId) data.book_request_id = Number(bookRequestId);

      const conversation = await conversationsService.createConversation(data);
      router.replace(`/messages/${conversation.id}`);
    } catch {
      setError(t("messages.sendError"));
      setIsCreating(false);
      creatingAttempted.current = false;
    }
  }, [recipientId, bookId, bookRequestId, router]);

  // Trigger conversation creation when authenticated
  useEffect(() => {
    if (
      newParam === "true" &&
      recipientId &&
      isAuthenticated &&
      !creatingAttempted.current
    ) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        createConversationFromParams();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [newParam, recipientId, isAuthenticated, createConversationFromParams]);

  // Load conversations
  const loadConversations = async (page: number = 1, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await conversationsService.getConversations({
        page,
        per_page: 20,
      });

      if (append) {
        setConversations((prev) => [...prev, ...response.data]);
      } else {
        setConversations(response.data);
      }
      setTotalPages(response.meta.last_page);
      setCurrentPage(response.meta.current_page);
    } catch {
      setError(t("messages.loadError"));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Don't load conversations if we're creating a new one
    if (newParam === "true" && recipientId) return;

    let cancelled = false;

    const fetchConversations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await conversationsService.getConversations({
          page: 1,
          per_page: 20,
        });

        if (!cancelled) {
          setConversations(response.data);
          setTotalPages(response.meta.last_page);
          setCurrentPage(response.meta.current_page);
        }
      } catch {
        if (!cancelled) {
          setError(t("messages.loadError"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchConversations();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, newParam, recipientId]);

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      loadConversations(currentPage + 1, true);
    }
  };

  // Show creating state
  if (newParam === "true" && recipientId && isCreating) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">
              {t("messages.sending")}
            </span>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 max-w-2xl mx-auto space-y-4 pb-20 md:pb-4">
        <PageHeader title={t("messages.title")} description={t("messages.conversations")} />

        {isLoading && <LoadingState message={t("messages.loadingConversations")} />}

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadConversations(1)}
              className="mt-3"
            >
              {t("common.tryAgain")}
            </Button>
          </div>
        )}

        {!isLoading && !error && conversations.length === 0 && (
          <EmptyState
            title={t("messages.noConversations")}
            description={t("messages.noConversationsDesc")}
          />
        )}

        {!isLoading && !error && conversations.length > 0 && (
          <>
            <ConversationList conversations={conversations} />

            {currentPage < totalPages && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      {t("common.loading")}
                    </>
                  ) : (
                    t("messages.loadMore")
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

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="p-4 max-w-2xl mx-auto">
            <LoadingState />
          </div>
        </AppLayout>
      }
    >
      <MessagesPageContent />
    </Suspense>
  );
}