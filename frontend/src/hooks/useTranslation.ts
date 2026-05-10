"use client";

import { useMemo } from "react";
import { useLocale } from "@/contexts/LocaleContext";

import en from "@/locales/en.json";
import it from "@/locales/it.json";

const translations: Record<string, Record<string, unknown>> = {
  en,
  it,
};

type TranslationKey = string;

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  if (typeof current === "string") {
    return current;
  }
  return undefined;
}

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return params[key]?.toString() ?? "";
  });
}

export function useTranslation() {
  const { locale } = useLocale();

  const t = useMemo(() => {
    const dict = translations[locale] || translations.en;

    return (key: TranslationKey, params?: Record<string, string | number>): string => {
      const value = getNestedValue(dict, key);
      if (value === undefined) {
        // Fallback to English if translation not found
        const fallback = getNestedValue(translations.en, key);
        if (fallback === undefined) {
          return key;
        }
        return params ? interpolate(fallback, params) : fallback;
      }
      return params ? interpolate(value, params) : value;
    };
  }, [locale]);

  return { t, locale };
}