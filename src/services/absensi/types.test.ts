import { describe, expect, it } from "vitest";
import { schemaCreateAbsensiRequest, schemaUpdateAbsensiRequest } from "./types";

describe("schemaCreateAbsensiRequest", () => {
  it("requires pesertaMagangId, kehadiran, and tanggal", () => {
    const result = schemaCreateAbsensiRequest.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts a minimal valid payload with no jam", () => {
    const result = schemaCreateAbsensiRequest.safeParse({
      pesertaMagangId: "peserta-1",
      kehadiran: "Hadir",
      tanggal: "2026-07-16",
    });
    expect(result.success).toBe(true);
  });
});

describe("schemaUpdateAbsensiRequest", () => {
  // Regression test: the roster's "quick mark" mutation updates kehadiran
  // without ever touching tanggal — the schema must allow that.
  it("allows omitting tanggal entirely", () => {
    const result = schemaUpdateAbsensiRequest.safeParse({ kehadiran: "Sakit" });
    expect(result.success).toBe(true);
  });

  it("does not require pesertaMagangId (can't be changed after creation)", () => {
    const result = schemaUpdateAbsensiRequest.safeParse({ kehadiran: "Hadir", tanggal: "2026-07-16" });
    expect(result.success).toBe(true);
    expect(result.success && "pesertaMagangId" in result.data).toBe(false);
  });
});
