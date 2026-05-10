"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">LibroSchool</h1>
        <p className="text-lg text-muted-foreground">
          {t("home.tagline")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login">
            <Button size="lg">{t("auth.login")}</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">
              {t("auth.register")}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
