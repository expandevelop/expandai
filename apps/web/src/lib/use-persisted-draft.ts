"use client";

import { useEffect, useState } from "react";

const DRAFT_STORAGE_PREFIX = "expandai:web:draft:";

function getDraftStorageKey(scope: string) {
  return `${DRAFT_STORAGE_PREFIX}${scope}`;
}

export function usePersistedDraft<T extends Record<string, unknown>>(
  scope: string,
  initialState: T,
) {
  const [draft, setDraft] = useState<T>(initialState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsReady(true);
      return;
    }

    try {
      const rawValue = window.localStorage.getItem(getDraftStorageKey(scope));

      if (!rawValue) {
        setDraft(initialState);
        setIsReady(true);
        return;
      }

      const parsedValue = JSON.parse(rawValue) as Partial<T>;
      setDraft({
        ...initialState,
        ...parsedValue,
      });
    } catch {
      window.localStorage.removeItem(getDraftStorageKey(scope));
      setDraft(initialState);
    } finally {
      setIsReady(true);
    }
  }, [initialState, scope]);

  useEffect(() => {
    if (!isReady || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(getDraftStorageKey(scope), JSON.stringify(draft));
  }, [draft, isReady, scope]);

  function setDraftField<K extends keyof T>(key: K, value: T[K]) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [key]: value,
    }));
  }

  function replaceDraft(nextDraft: T) {
    setDraft(nextDraft);
  }

  function resetDraft() {
    setDraft(initialState);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(getDraftStorageKey(scope));
    }
  }

  return {
    draft,
    isReady,
    setDraft,
    setDraftField,
    replaceDraft,
    resetDraft,
  };
}
