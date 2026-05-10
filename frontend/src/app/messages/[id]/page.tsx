"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/Layouts";
import { LoadingState } from "@/components/States";
import { MessageBubble, MessageInput } from "@/features/messages";
import { conversationsService } from "@/services/conversations";
import { Conversation, Message } from "@/types/conversation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Loader2, BookOpen, BookMarked } from "lucide-react";

export default function ConversationDetailPage() {
  const params = useParams();
  const conversationId = Number(params.id);
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load conversation details
  useEffect(() => {
    if (!isAuthenticated || !conversationId) return;

    const fetchConversation = async () => {
      setIsLoadingConversation(true);
      setError(null);

      try {
        const data = await conversationsService.getConversation(conversationId);
        setConversation(data);
      } catch {
        setError(t("messages.loadError"));
      } finally {
        setIsLoadingConversation(false);
      }
    };

    fetchConversation();
  }, [isAuthenticated, conversationId]);

  // Load messages - separate effect to avoid cascading setState issue
  const loadMessages = useCallback(
    async (page: number = 1, append = false) => {
      if (!conversationId) return;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingMessages(true);
      }

      try {
        const response = await conversationsService.getMessages(conversationId, {
          page,
          per_page: 30,
        });

        if (append) {
          setMessages((prev) => [...response.data, ...prev]);
        } else {
          setMessages(response.data);
          // Scroll to bottom on initial load
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
          }, 50);
        }
        setTotalPages(response.meta.last_page);
        setCurrentPage(response.meta.current_page);
      } catch {
        setError(t("messages.loadError"));
      } finally {
        setIsLoadingMessages(false);
        setIsLoadingMore(false);
      }
    },
    [conversationId]
  );

  // Load messages when conversation is loaded
  useEffect(() => {
    if (!isAuthenticated || !conversationId || !conversation) return;

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadMessages(1);
    }
  }, [isAuthenticated, conversationId, conversation, loadMessages]);

  // Handle sending message
  const handleSendMessage = async (body: string) => {
    if (!conversationId) return;

    try {
      const newMessage = await conversationsService.sendMessage(conversationId, {
        body,
      });
      setMessages((prev) => [...prev, newMessage]);
      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch {
      setError(t("messages.sendError"));
      throw new Error("Failed to send message");
    }
  };

  // Handle refresh for new messages (manual polling for MVP)
  const handleRefresh = async () => {
    if (isLoadingMessages) return;
    await loadMessages(1);
  };

  // Handle load older messages
  const handleLoadOlder = async () => {
    if (currentPage < totalPages && !isLoadingMore) {
      const prevScrollHeight = messagesContainerRef.current?.scrollHeight || 0;
      await loadMessages(currentPage + 1, true);
      // Maintain scroll position when prepending older messages
      setTimeout(() => {
        if (messagesContainerRef.current) {
          const newScrollHeight = messagesContainerRef.current.scrollHeight;
          messagesContainerRef.current.scrollTop =
            newScrollHeight - prevScrollHeight;
        }
      }, 50);
    }
  };

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

  if (isLoadingConversation) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto">
          <LoadingState message={t("messages.loadingConversation")} />
        </div>
      </AppLayout>
    );
  }

  if (error && !conversation) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto text-center">
          <p className="text-destructive">{error}</p>
          <Link href="/messages">
            <Button variant="outline" size="sm" className="mt-3">
              <ArrowLeft className="size-4" />
              {t("messages.backToMessages")}
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const contextLabel = conversation?.book
    ? conversation.book.title
    : conversation?.book_request
      ? conversation.book_request.title
      : null;

  const ContextIcon = conversation?.book ? BookOpen : BookMarked;

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-3.5rem)] flex flex-col max-w-2xl mx-auto">
        {/* Header */}
        <div className="border-b px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/messages">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="size-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-medium text-base">
                  {conversation?.other_user.name}
                </h1>
                {contextLabel && (
                  <div className="flex items-center gap-1">
                    <ContextIcon className="size-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {contextLabel}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoadingMessages}
            >
              <RefreshCw
                className={`size-4 ${isLoadingMessages ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        >
          {/* Load older messages button */}
          {currentPage < totalPages && (
            <div className="flex justify-center pb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadOlder}
                disabled={isLoadingMore}
                className="text-xs"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="size-3 animate-spin mr-1" />
                    {t("common.loading")}
                  </>
                ) : (
                  t("messages.loadOlder")
                )}
              </Button>
            </div>
          )}

          {isLoadingMessages && messages.length === 0 && (
            <LoadingState message={t("messages.loadingMessages")} />
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUserId={user?.id || 0}
              otherUserName={conversation?.other_user.name}
              showSenderName={true}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <MessageInput
          onSend={handleSendMessage}
          disabled={isLoadingConversation || isLoadingMessages}
        />
      </div>
    </AppLayout>
  );
}