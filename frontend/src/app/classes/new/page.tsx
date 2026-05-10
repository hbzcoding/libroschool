"use client";

import Link from "next/link";
import { AppLayout } from "@/components/Layouts";
import { CreateClassroomForm } from "@/features/classrooms/CreateClassroomForm";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingState } from "@/components/States";

export default function NewClassroomPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

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
        {/* Back link */}
        <Link
          href="/classes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to Classrooms
        </Link>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Classroom
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set up a new classroom for your class.
          </p>
        </div>

        <CreateClassroomForm />
      </div>
    </AppLayout>
  );
}
