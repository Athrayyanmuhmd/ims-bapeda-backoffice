import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useQueryBuilder } from "./use-query-builder";

const push = vi.fn();
let currentSearch = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/peserta-magang",
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

beforeEach(() => {
  push.mockClear();
  currentSearch = "";
});

describe("useQueryBuilder — reading params", () => {
  it("falls back to the given defaults when the URL has nothing", () => {
    const { result } = renderHook(() => useQueryBuilder({ defaultPage: 1, defaultRows: 10 }));

    expect(result.current.page).toBe(1);
    expect(result.current.rows).toBe(10);
    expect(result.current.searchFilters).toBeUndefined();
  });

  it("parses page/rows straight from the URL", () => {
    currentSearch = "page=3&rows=20";
    const { result } = renderHook(() => useQueryBuilder());

    expect(result.current.page).toBe(3);
    expect(result.current.rows).toBe(20);
  });

  it("parses searchFilters JSON from the URL", () => {
    currentSearch = `searchFilters=${encodeURIComponent(JSON.stringify({ name: "andi" }))}`;
    const { result } = renderHook(() => useQueryBuilder({ defaultSearchKeys: ["name"] }));

    expect(result.current.searchFilters).toEqual({ name: "andi" });
    expect(result.current.searchValue).toBe("andi");
  });
});

describe("useQueryBuilder — setPage", () => {
  it("pushes the new page into the URL", () => {
    const { result } = renderHook(() => useQueryBuilder({ defaultPage: 1 }));

    result.current.setPage(4);

    expect(push).toHaveBeenCalledWith("/peserta-magang?page=4", { scroll: false });
  });

  it("omits the page param entirely when it equals the default", () => {
    currentSearch = "page=2";
    const { result } = renderHook(() => useQueryBuilder({ defaultPage: 1 }));

    result.current.setPage(1);

    expect(push).toHaveBeenCalledWith("/peserta-magang?", { scroll: false });
  });
});

describe("useQueryBuilder — setSearch", () => {
  it("applies the value to every default search key and resets to page 1", () => {
    currentSearch = "page=3";
    const { result } = renderHook(() => useQueryBuilder({ defaultSearchKeys: ["name", "email"] }));

    result.current.setSearch("sari");

    const [url] = push.mock.calls[0];
    expect(url).not.toContain("page="); // reset to default page 1, so it's dropped
    expect(url).toContain(encodeURIComponent(JSON.stringify({ name: "sari", email: "sari" })));
  });

  it("clears the filter entirely for an empty search value", () => {
    currentSearch = `searchFilters=${encodeURIComponent(JSON.stringify({ name: "sari" }))}`;
    const { result } = renderHook(() => useQueryBuilder({ defaultSearchKeys: ["name"] }));

    result.current.setSearch("");

    const [url] = push.mock.calls[0];
    expect(url).not.toContain("searchFilters");
  });

  it("warns and does nothing when no defaultSearchKeys were configured", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useQueryBuilder());

    result.current.setSearch("anything");

    expect(push).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe("useQueryBuilder — toggleOrder", () => {
  it("starts a new column at asc", () => {
    const { result } = renderHook(() => useQueryBuilder());

    result.current.toggleOrder("name");

    const [url] = push.mock.calls[0];
    expect(url).toContain("orderKey=name");
    expect(url).toContain("orderRule=asc");
  });

  it("flips asc to desc on the same column", () => {
    currentSearch = "orderKey=name&orderRule=asc";
    const { result } = renderHook(() => useQueryBuilder());

    result.current.toggleOrder("name");

    const [url] = push.mock.calls[0];
    expect(url).toContain("orderRule=desc");
  });
});

describe("useQueryBuilder — resetAll", () => {
  it("pushes the bare pathname with no query string", () => {
    currentSearch = "page=5&searchFilters=%7B%7D";
    const { result } = renderHook(() => useQueryBuilder());

    result.current.resetAll();

    expect(push).toHaveBeenCalledWith("/peserta-magang", { scroll: false });
  });
});
