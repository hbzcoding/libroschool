"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LocaleSelector } from "@/components/LocaleSelector";
import {
  BookOpen,
  BookMarked,
  Users,
  StickyNote,
  MessageCircle,
  Home,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { href: "/dashboard", label: t("nav.home"), icon: Home },
    { href: "/books", label: t("nav.books"), icon: BookOpen },
    { href: "/requests", label: t("nav.requests"), icon: BookMarked },
    { href: "/classes", label: t("nav.classes"), icon: Users },
    { href: "/notes", label: t("nav.notes"), icon: StickyNote },
    { href: "/messages", label: t("nav.messages"), icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Desktop header */}
      <header className="hidden md:flex items-center justify-between border-b px-6 h-14">
        <Link href="/dashboard" className="font-semibold text-lg">
          LibroSchool
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="size-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSelector />
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="size-4" />
              {user?.name}
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between border-b px-4 h-14">
        <Link href="/dashboard" className="font-semibold text-lg">
          LibroSchool
        </Link>
        <div className="flex items-center gap-1">
          <LocaleSelector />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileMenuOpen && (
        <nav className="md:hidden fixed inset-0 top-14 z-50 bg-background border-b p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                >
                  <Icon className="size-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
          <div className="border-t pt-2 mt-2">
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant="ghost" className="w-full justify-start gap-3">
                <User className="size-4" />
                {user?.name}
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive"
              onClick={logout}
            >
              <LogOut className="size-4" />
              {t("auth.logout")}
            </Button>
          </div>
        </nav>
      )}

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t flex items-center justify-around h-16 z-50">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="md:hidden h-16" />
    </div>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-semibold text-2xl">
            LibroSchool
          </Link>
          <p className="text-sm text-muted-foreground mt-1">
            {t("dashboard.browseBooksDesc")}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}