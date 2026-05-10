"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form";
import { classroomsService } from "@/services/classrooms";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const joinSchema = z.object({
  join_code: z
    .string()
    .min(1, "Join code is required")
    .max(20, "Code too long"),
});

type JoinFormData = z.infer<typeof joinSchema>;

interface JoinClassroomFormProps {
  className?: string;
  onSuccess?: () => void;
}

export function JoinClassroomForm({ className, onSuccess }: JoinClassroomFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinFormData>({
    resolver: zodResolver(joinSchema),
  });

  const onSubmit = async (data: JoinFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const classroom = await classroomsService.joinByCode(data.join_code.toUpperCase());

      if (onSuccess) {
        onSuccess();
      }
      router.push(`/classes/${classroom.id}`);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        setError("Invalid join code or classroom not found.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-4", className)}
    >
      <div className="space-y-2">
        <label htmlFor="join_code" className="text-sm font-medium">
          Join Code <span className="text-destructive">*</span>
        </label>
        <Input
          id="join_code"
          {...register("join_code")}
          placeholder="Enter the 6-character code"
          disabled={isSubmitting}
          className="uppercase"
          aria-invalid={!!errors.join_code}
          maxLength={20}
        />
        {errors.join_code && (
          <FormMessage>{errors.join_code.message}</FormMessage>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            Joining...
          </>
        ) : (
          "Join Classroom"
        )}
      </Button>
    </form>
  );
}
