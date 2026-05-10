"use client";

import Link from "next/link";
import { Conversation } from "@/types/conversation";
import { Card } from "@/components/ui/card";
import { BookOpen, BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: Conversation[];
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ConversationList({ conversations }: ConversationListProps) {
  return (
    <div className="space-y-1">
      {conversations.map((conversation) => (
        <ConversationItem key={conversation.id} conversation={conversation} />
      ))}
    </div>
  );
}

function ConversationItem({ conversation }: { conversation: Conversation }) {
  const contextLabel = conversation.book
    ? conversation.book.title
    : conversation.book_request
      ? conversation.book_request.title
      : null;

  const contextIcon = conversation.book ? BookOpen : BookMarked;

  const lastMessageTime = conversation.latest_message
    ? formatTime(conversation.latest_message.created_at)
    : formatTime(conversation.updated_at);

  const previewText = conversation.latest_message
    ? conversation.latest_message.body.length > 50
      ? conversation.latest_message.body.slice(0, 50) + "..."
      : conversation.latest_message.body
    : "No messages yet";

  const Icon = contextIcon;

  return (
    <Link href={`/messages/${conversation.id}`}>
      <Card
        className={cn(
          "border-border/50 hover:bg-muted/50 transition-colors cursor-pointer",
          "px-4 py-3"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
            {conversation.other_user.name.charAt(0).toUpperCase()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm truncate">
                {conversation.other_user.name}
              </span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {lastMessageTime}
              </span>
            </div>

            {contextLabel && (
              <div className="flex items-center gap-1 mt-0.5">
                <Icon className="size-3 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  {contextLabel}
                </span>
              </div>
            )}

            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {previewText}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
