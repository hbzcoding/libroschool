"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 5;

interface ImageFile {
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

interface ImageUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  maxImages?: number;
  className?: string;
  error?: string;
}

export function ImageUploader({
  onUpload,
  maxImages = MAX_IMAGES,
  className,
  error,
}: ImageUploaderProps) {
  const { t } = useTranslation();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return t("books.images.invalidType");
      }
      if (file.size > MAX_SIZE) {
        return t("books.images.tooLarge");
      }
      if (images.length + 1 > maxImages) {
        return t("books.images.maxImages", { count: maxImages });
      }
      return null;
    },
    [images.length, maxImages, t]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const newImages: ImageFile[] = [];
      const errors: string[] = [];

      for (const file of fileArray) {
        if (newImages.length + images.length >= maxImages) {
          errors.push(t("books.images.maxImages", { count: maxImages }));
          break;
        }
        const validationError = validateFile(file);
        if (validationError) {
          newImages.push({
            file,
            preview: "",
            progress: 0,
            error: validationError,
          });
        } else {
          newImages.push({
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
          });
        }
      }

      setImages((prev) => [...prev, ...newImages]);
    },
    [images.length, maxImages, validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (isUploading) return;
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles, isUploading]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
        e.target.value = "";
      }
    },
    [handleFiles]
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleUpload = useCallback(async () => {
    const validImages = images.filter((img) => !img.error);
    if (validImages.length === 0 || isUploading) return;

    setIsUploading(true);
    try {
      const files = validImages.map((img) => img.file);
      await onUpload(files);
      // Clear previews after successful upload
      setImages((prev) => {
        prev.forEach((img) => {
          if (img.preview) URL.revokeObjectURL(img.preview);
        });
        return [];
      });
    } catch {
      setImages((prev) =>
        prev.map((img) =>
          !img.error ? { ...img, error: t("books.images.uploadFailed"), progress: 0 } : img
        )
      );
    } finally {
      setIsUploading(false);
    }
  }, [images, isUploading, onUpload]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <div className="flex items-center justify-center rounded-full bg-muted p-2">
          {isUploading ? (
            <div className="size-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="size-5 text-muted-foreground" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            {isUploading ? t("books.images.uploading") : t("books.images.clickOrDrag")}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("books.images.constraints", { maxImages })}
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              {image.preview ? (
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full flex items-center justify-center">
                  <ImageIcon className="size-5 text-muted-foreground" />
                </div>
              )}
              {image.progress > 0 && image.progress < 100 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-xs text-white font-medium">
                    {image.progress}%
                  </span>
                </div>
              )}
              {!isUploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute top-1 right-1 flex items-center justify-center size-5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="size-3" />
                </button>
              )}
              {image.error && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-1">
                  <p className="text-[10px] text-red-300 text-center leading-tight">
                    {image.error}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {images.some((img) => !img.error) && (
        <Button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? t("books.images.uploading") : t("books.images.uploadButton")}
        </Button>
      )}

      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
}