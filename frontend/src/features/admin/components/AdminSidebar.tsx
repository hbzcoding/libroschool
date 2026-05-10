"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { name: t("admin.dashboard"), href: "/admin" },
    { name: t("admin.users"), href: "/admin/users" },
    { name: t("admin.books"), href: "/admin/books" },
    { name: t("admin.requests"), href: "/admin/requests" },
    { name: t("admin.notes"), href: "/admin/notes" },
    { name: t("admin.classrooms"), href: "/admin/classrooms" },
    { name: t("admin.reports"), href: "/admin/reports" },
    { name: t("admin.schools"), href: "/admin/schools" },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[#23252a] bg-[#010102] hidden md:block">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-[#5e6ad2] flex items-center justify-center">
              <span className="text-sm font-semibold text-white">A</span>
            </div>
            <span className="font-semibold text-[#f7f8f8]">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-[#141516] text-[#f7f8f8] border border-[#23252a]"
                      : "text-[#8a8f98] hover:bg-[#0f1011] hover:text-[#d0d6e0]"
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-[#23252a] p-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#8a8f98] hover:bg-[#0f1011] hover:text-[#d0d6e0] transition-colors"
          >
            {t("admin.backToApp")}
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { name: t("admin.dashboard"), href: "/admin" },
    { name: t("admin.users"), href: "/admin/users" },
    { name: t("admin.books"), href: "/admin/books" },
    { name: t("admin.requests"), href: "/admin/requests" },
    { name: t("admin.notes"), href: "/admin/notes" },
    { name: t("admin.classrooms"), href: "/admin/classrooms" },
    { name: t("admin.reports"), href: "/admin/reports" },
    { name: t("admin.schools"), href: "/admin/schools" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#23252a] bg-[#010102] md:hidden">
      <div className="flex justify-around py-2">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center px-2 py-1 text-xs",
              pathname === item.href
                ? "text-[#5e6ad2]"
                : "text-[#8a8f98]"
            )}
          >
            <span className="mb-0.5">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}