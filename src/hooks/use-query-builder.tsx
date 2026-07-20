"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { TPaginationRequest } from "@/types/request";

interface UseQueryBuilderOptions {
  defaultPage?: number;
  defaultRows?: number;
  defaultSearchKeys?: string[]; // Array of search keys
  defaultOrderKey?: string;
  defaultOrderRule?: "asc" | "desc";
}

export function useQueryBuilder(options: UseQueryBuilderOptions = {}) {
  const {
    defaultPage = 1,
    defaultRows = 10,
    defaultSearchKeys = [],
    defaultOrderKey,
    defaultOrderRule,
  } = options;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse current URL params into TPaginationRequest
  const params = useMemo<TPaginationRequest>(() => {
    const page = searchParams.get("page");
    const rows = searchParams.get("rows");
    const searchFilters = searchParams.get("searchFilters");
    const orderKey = searchParams.get("orderKey");
    const orderRule = searchParams.get("orderRule") as "asc" | "desc" | null;

    return {
      page: page ? Number.parseInt(page) : defaultPage,
      rows: rows ? Number.parseInt(rows) : defaultRows,
      searchFilters: searchFilters ? JSON.parse(searchFilters) : undefined,
      orderKey: orderKey || defaultOrderKey,
      orderRule: orderRule || defaultOrderRule,
    };
  }, [searchParams, defaultPage, defaultRows, defaultOrderKey, defaultOrderRule]);

  // Update URL with new params
  const updateParams = useCallback(
    (newParams: Partial<TPaginationRequest>, resetPage = false) => {
      const urlParams = new URLSearchParams(searchParams.toString());

      const merged: TPaginationRequest = {
        ...params,
        ...newParams,
        page: resetPage ? 1 : (newParams.page ?? params.page),
      };

      Object.entries(merged).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          urlParams.delete(key);
        } else if (typeof value === "object") {
          const isEmpty = Array.isArray(value)
            ? value.length === 0
            : Object.keys(value).length === 0;

          if (isEmpty) {
            urlParams.delete(key);
          } else {
            urlParams.set(key, JSON.stringify(value));
          }
        } else {
          urlParams.set(key, value.toString());
        }
      });

      if (merged.page === defaultPage) urlParams.delete("page");
      if (merged.rows === defaultRows) urlParams.delete("rows");

      router.push(`${pathname}?${urlParams.toString()}`, {
        scroll: false,
      });
    },
    [searchParams, params, pathname, router, defaultPage, defaultRows]
  );

  // Convenience methods
  const setPage = useCallback((page: number) => updateParams({ page }), [updateParams]);

  const setRows = useCallback((rows: number) => updateParams({ rows }, true), [updateParams]);

  // Search with single key
  const setSearchByKey = useCallback(
    (key: string, value: string) => {
      const newSearchFilters = { ...params.searchFilters };
      if (value) {
        newSearchFilters[key] = value;
      } else {
        delete newSearchFilters[key];
      }
      updateParams({ searchFilters: newSearchFilters }, true);
    },
    [params.searchFilters, updateParams]
  );

  // Search with default keys (applies same value to all defaultSearchKeys)
  const setSearch = useCallback(
    (value: string) => {
      if (defaultSearchKeys.length === 0) {
        console.warn("No defaultSearchKeys provided to useQueryBuilder");
        return;
      }

      const newSearchFilters: Record<string, string> = {};

      if (value) {
        // Apply the same search value to all default search keys
        defaultSearchKeys.forEach((key) => {
          newSearchFilters[key] = value;
        });
      }
      // If value is empty, searchFilters will be empty object (cleared)

      updateParams({ searchFilters: newSearchFilters }, true);
    },
    [defaultSearchKeys, updateParams]
  );

  // Get the current search value (from first defaultSearchKey)
  const searchValue = useMemo(() => {
    if (defaultSearchKeys.length === 0) return "";
    return params.searchFilters?.[defaultSearchKeys[0]] || "";
  }, [params.searchFilters, defaultSearchKeys]);

  const setOrder = useCallback(
    (orderKey: string, orderRule: "asc" | "desc") => {
      updateParams({ orderKey, orderRule });
    },
    [updateParams]
  );

  const toggleOrder = useCallback(
    (key: string) => {
      if (params.orderKey === key) {
        const newRule = params.orderRule === "asc" ? "desc" : "asc";
        updateParams({ orderRule: newRule });
      } else {
        updateParams({ orderKey: key, orderRule: "asc" });
      }
    },
    [params.orderKey, params.orderRule, updateParams]
  );

  const clearFilters = useCallback(() => {
    updateParams({
      searchFilters: undefined,
      page: defaultPage,
    });
  }, [updateParams, defaultPage]);

  const resetAll = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    // The params object ready for your API
    params,

    // Individual values for convenience
    page: params.page ?? defaultPage,
    rows: params.rows ?? defaultRows,
    searchFilters: params.searchFilters,
    searchValue, // Current search value (from first defaultSearchKey)
    orderKey: params.orderKey,
    orderRule: params.orderRule,

    // Update methods
    setPage,
    setRows,
    setSearch, // Uses defaultSearchKeys array
    setSearchByKey, // For individual key search
    setOrder,
    toggleOrder,
    clearFilters,
    resetAll,
    updateParams,
  };
}
