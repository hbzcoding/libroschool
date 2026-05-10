"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/Layouts";
import { LoadingState } from "@/components/States";
import { Card, CardContent } from "@/components/ui/card";
import { CreateRequestForm } from "@/features/requests";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { ArrowLeft } from "lucide-react";

export default function NewRequestPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <AppLayout>
        <div className="p-4 max-w-lg mx-auto">
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
      <div className="p-4 max-w-lg mx-auto space-y-6 pb-20 md:pb-4">
        {/* Back link */}
        <Link
          href="/requests"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          {t("common.backToRequests")}
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("requests.createRequestTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("requests.createRequestDesc")}
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="pt-6">
            <CreateRequestForm />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
