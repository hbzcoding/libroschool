"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/Layouts";
import { PageHeader } from "@/components/States";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  BookMarked,
  Users,
  StickyNote,
  MessageCircle,
  Plus,
} from "lucide-react";

const QUICK_ACTIONS = [
  {
    href: "/books/new",
    label: "Sell a Book",
    description: "List your used books for sale",
    icon: Plus,
    color: "bg-primary/10 text-primary",
  },
  {
    href: "/books",
    label: "Browse Books",
    description: "Find books from other students",
    icon: BookOpen,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    href: "/requests/new",
    label: "Request a Book",
    description: "Ask for a book you need",
    icon: BookMarked,
    color: "bg-green-500/10 text-green-600",
  },
  {
    href: "/requests",
    label: "Browse Requests",
    description: "See what others are looking for",
    icon: BookMarked,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    href: "/classes",
    label: "My Classes",
    description: "Join or create a classroom",
    icon: Users,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    href: "/notes",
    label: "Notes",
    description: "Share and browse study notes",
    icon: StickyNote,
    color: "bg-yellow-500/10 text-yellow-600",
  },
  {
    href: "/messages",
    label: "Messages",
    description: "Chat with other students",
    icon: MessageCircle,
    color: "bg-pink-500/10 text-pink-600",
  },
];

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-4 max-w-2xl mx-auto">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="p-4 max-w-2xl mx-auto space-y-6">
        <PageHeader title={`Welcome, ${user.name}`} />

        {/* Profile summary */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Link href="/profile">
                <button className="text-sm text-primary hover:underline">
                  Edit Profile
                </button>
              </Link>
            </div>
            {(user.grade || user.track) && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                {user.grade && <span>Grade {user.grade}</span>}
                {user.grade && user.track && <span>&middot;</span>}
                {user.track && (
                  <span className="capitalize">{user.track}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <div>
          <h2 className="text-lg font-medium mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                    <CardContent className="flex items-start gap-3">
                      <div
                        className={`flex items-center justify-center rounded-lg p-2 ${action.color}`}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{action.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {action.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}