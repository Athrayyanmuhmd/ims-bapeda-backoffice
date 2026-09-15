import { describe, expect, it } from "vitest";
import {
  daysUntil,
  fmtJam,
  fmtTanggal,
  fmtTanggalShort,
  hariKerjaEfektif,
  toDateInput,
  toTimeInput,
} from "./datetime";

// The backend stores tanggal at UTC midnight. Rendering that in a local zone is
// what shifted the displayed day; these lock the UTC reading in.
describe("calendar dates are read in UTC", () => {
  it("keeps the stored day for a UTC-midnight tanggal", () => {
    expect(toDateInput("2026-07-16T00:00:00.000Z")).toBe("2026-07-16");
    expect(fmtTanggalShort("2026-07-16T00:00:00.000Z")).toBe("16/07/2026");
  });

  it("does not roll back a day at the start of the year", () => {
    expect(toDateInput("2026-01-01T00:00:00.000Z")).toBe("2026-01-01");
  });

  it("renders a placeholder for a missing date", () => {
    expect(fmtTanggal(null)).toBe("-");
    expect(fmtTanggalShort(undefined)).toBe("-");
  });

  it("returns an empty string for a missing date input value", () => {
    expect(toDateInput(null)).toBe("");
  });
});

// jamMasuk/jamKeluar are instants: 01:00Z is 08:00 WIB.
describe("times are read in the office zone", () => {
  it("renders a stored instant as office wall-clock", () => {
    expect(fmtJam("2026-07-16T01:00:00.000Z")).toBe("08:00");
    expect(toTimeInput("2026-07-16T01:05:00.000Z")).toBe("08:05");
  });

  it("rolls into the next office day for a late-evening UTC instant", () => {
    // 18:30Z on the 15th is 01:30 WIB on the 16th.
    expect(fmtJam("2026-07-15T18:30:00.000Z")).toBe("01:30");
  });

  it("renders placeholders for a missing time", () => {
    expect(fmtJam(null)).toBe("-");
    expect(toTimeInput(null)).toBe("");
  });
});

describe("daysUntil", () => {
  it("is 0 for today in the office zone", () => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}T00:00:00.000Z`;

    // Guard against the assertion itself being off by a day when the host clock
    // and the office zone fall on different calendar dates.
    expect(Math.abs(daysUntil(iso))).toBeLessThanOrEqual(1);
  });

  it("counts whole days without rounding to the wrong side", () => {
    const base = daysUntil("2026-07-16T00:00:00.000Z");
    expect(daysUntil("2026-07-17T00:00:00.000Z")).toBe(base + 1);
    expect(daysUntil("2026-07-15T00:00:00.000Z")).toBe(base - 1);
  });
});

describe("hariKerjaEfektif", () => {
  it("counts weekdays through an explicit end date", () => {
    // Mon 2026-08-10 .. Fri 2026-08-14 = 5 weekdays
    expect(hariKerjaEfektif("2026-08-10T00:00:00.000Z", "2026-08-14T00:00:00.000Z", "2026-08-14")).toBe(
      5
    );
  });

  it("stops at today when the period is still open", () => {
    // Period runs to Sep 30, but "today" is Aug 14 → same as through Aug 14
    expect(hariKerjaEfektif("2026-08-10T00:00:00.000Z", "2026-09-30T00:00:00.000Z", "2026-08-14")).toBe(
      5
    );
  });

  it("uses selesai when the period has already ended", () => {
    expect(hariKerjaEfektif("2026-08-10T00:00:00.000Z", "2026-08-12T00:00:00.000Z", "2026-08-20")).toBe(
      3
    );
  });
});
