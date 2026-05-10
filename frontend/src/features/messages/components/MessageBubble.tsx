"use client";

import { Message } from "@/types/conversation";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  currentUserId: number;
  otherUserName?: string;
  showSenderName?: boolean;
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({
  message,
  currentUserId,
  otherUserName,
  showSenderName = false,
}: MessageBubbleProps) {
  const isSent = message.sender_id === currentUserId;

  return (
    <div
      className={cn(
        "flex flex-col",
        isSent ? "items-end" : "items-start"
      )}
    >
      {showSenderName && !isSent && otherUserName && (
        <span className="text-xs text-muted-foreground mb-1 ml-1">
          {otherUserName}
        </span>
      )}
      <div
        className={cn(
          "max-w-[80%] px-3 py-2 rounded-lg text-sm break-words",
          isSent
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        )}
      >
        <p className="whitespace-pre-wrap">{message.body}</p>
      </div>
      <span
        className={cn(
          "text-[11px] text-muted-foreground mt-0.5 px-1",
          isSent ? "mr-1" : "ml-1"
        )}
      >
        {formatMessageTime(message.created_at)}
      </span>
    </div>
  );
}
