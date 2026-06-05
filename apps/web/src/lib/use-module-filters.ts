"use client";

import { useEffect, useMemo, useState } from "react";

export type PersistedFiltersState = Record<string, string>;

const FILTERS_STORAGE_PREFIX = "expandai:web:filters:";

function getStorageKey(scope: string) {
  return `${FILTERS_STORAGE_PREFIX}${scope}`;
}

export function useModuleFilters<T extends PersistedFiltersState>(
  scope: string,
  initialState: T,
) {
  const [filters, setFilters] = useState<T>(initialState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsReady(true);
      return;
    }

    try {
      const rawValue = window.localStorage.getItem(getStorageKey(scope));

      if (!rawValue) {
        setFilters(initialState);
        setIsReady(true);
        return;
      }

      const parsedValue = JSON.parse(rawValue) as Partial<T>;
      setFilters({
        ...initialState,
        ...parsedValue,
      });
    } catch {
      window.localStorage.removeItem(getStorageKey(scope));
      setFilters(initialState);
    } finally {
      setIsReady(true);
    }
  }, [initialState, scope]);

  useEffect(() => {
    if (!isReady || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(getStorageKey(scope), JSON.stringify(filters));
  }, [filters, isReady, scope]);

  function setFilter<K extends keyof T>(key: K, value: T[K]) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  }

  function resetFilters() {
    setFilters(initialState);
  }

  const hasActiveFilters = useMemo(
    () =>
      Object.keys(initialState).some(
        (key) => filters[key as keyof T] !== initialState[key as keyof T],
      ),
    [filters, initialState],
  );

  return {
    filters,
    isReady,
    hasActiveFilters,
    setFilter,
    resetFilters,
  };
}
