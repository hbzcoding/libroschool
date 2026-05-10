"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/Layouts";
import { PageHeader, LoadingState, EmptyState } from "@/components/States";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { bookRequestsService } from "@/services/bookRequests";
import { BookRequest } from "@/types/bookRequest";
import { EditRequestForm } from "@/features/requests/EditRequestForm";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";

export default function EditRequestPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const requestId = Number(params.id);

  const [request, setRequest] = useState<BookRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;

    const fetchRequest = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await bookRequestsService.getRequest(requestId);
        setRequest(response);
      } catch {
        setError("Failed to load request details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequest();
  }, [requestId]);

  // Check if user is owner
  if (!isLoading && request && user && request.buyer.id !== user.id) {
    return (
      <AppLayout>
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
          <PageHeader title="Edit Request" />
          <EmptyState
            title="Access Denied"
            description="You can only edit your own book requests."
            action={
              <Link href={`/requests/${requestId}`}>
                <Button variant="outline">View Request</Button>
              </Link>
            }
          />
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
          <LoadingState message="Loading request..." />
        </div>
      </AppLayout>
    );
  }

  if (error || !request) {
    return (
      <AppLayout>
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
          <PageHeader title="Edit Request" />
          <EmptyState
            title="Request Not Found"
            description={error || "This request does not exist or has been deleted."}
            action={
              <Link href="/requests">
                <Button variant="outline">Back to Requests</Button>
              </Link>
            }
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-2xl mx-auto pb-20 md:pb-4">
        <div className="mb-4">
          <Link href={`/requests/${requestId}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to Request
            </Button>
          </Link>
        </div>

        <PageHeader title="Edit Request" description={request.title} />

        <Card>
          <CardContent className="p-6">
            <EditRequestForm request={request} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
