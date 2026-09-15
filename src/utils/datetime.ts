import { DateTime } from "luxon";

// Two different kinds of value come back from the API and they must not be
// formatted the same way:
//
//   tanggal / tanggalMulai / tanggalSelesai — calendar dates, stored at UTC
//     midnight (see backend lib/datetime.ts). Read them in UTC; reading them in
//     the viewer's zone shifts the day for anyone west of Greenwich.
//
//   jamMasuk / jamKeluar — real instants. Render them in the office zone so an
//     08:00 clock-in reads as 08:00 regardless of where it's viewed.
//
// ponytail: one office, one zone. Swap this constant if Bapeda ever spans more.
export const APP_TIMEZONE = "Asia/Jakarta";

const asDate = (iso: string) => DateTime.fromISO(iso, { zone: "utc" }).setLocale("id");

const asInstant = (iso: string) => DateTime.fromISO(iso).setZone(APP_TIMEZONE).setLocale("id");

/* ---------- calendar dates ---------- */

export const fmtTanggal = (iso: string | null | undefined) =>
  iso ? asDate(iso).toLocaleString(DateTime.DATE_MED) : "-";

export const fmtTanggalLong = (iso: string | null | undefined) =>
  iso ? asDate(iso).toFormat("d LLLL yyyy") : "-";

export const fmtTanggalShort = (iso: string | null | undefined) =>
  iso ? asDate(iso).toFormat("dd/MM/yyyy") : "-";

// yyyy-MM-dd — for <input type="date"> values and CSV columns.
export const toDateInput = (iso: string | null | undefined) =>
  iso ? (asDate(iso).toISODate() ?? "") : "";

// A stored tanggal reduced to its calendar date, for comparing against todayIsoDate().
export const tanggalIsoDate = (iso: string | null | undefined) => toDateInput(iso);

/* ---------- instants ---------- */

export const fmtJam = (iso: string | null | undefined) =>
  iso ? asInstant(iso).toFormat("HH:mm") : "-";

// Blank rather than "-", so an empty <input type="time"> stays empty.
export const toTimeInput = (iso: string | null | undefined) =>
  iso ? asInstant(iso).toFormat("HH:mm") : "";

/* ---------- "now", in office terms ---------- */

// Comparisons against a stored tanggal use the office's idea of today, not the
// browser's — otherwise the daily roster flips over at the wrong hour.
export const todayInApp = () => DateTime.now().setZone(APP_TIMEZONE).startOf("day");

export const todayIsoDate = () => todayInApp().toISODate() ?? "";

export const nowJam = () => DateTime.now().setZone(APP_TIMEZONE).toFormat("HH:mm");

// Whole days from today until a stored calendar date. Both sides are reduced to
// a bare date first so a partial-day offset can't round the answer off by one.
export const daysUntil = (iso: string) =>
  Math.round(
    DateTime.fromISO(iso, { zone: "utc" })
      .startOf("day")
      .diff(DateTime.fromISO(todayIsoDate(), { zone: "utc" }), "days").days
  );

/** Inclusive weekday count (Mon–Fri). Fallback when API hasn't sent hariKerjaPeriode. */
export const countWeekdaysInclusive = (
  fromIso: string | null | undefined,
  toIso: string | null | undefined
): number => {
  const from = toDateInput(fromIso);
  const to = toDateInput(toIso);
  if (!from || !to || from > to) return 0;

  let count = 0;
  let cursor = DateTime.fromISO(from, { zone: "utc" });
  const end = DateTime.fromISO(to, { zone: "utc" });
  while (cursor <= end) {
    // Luxon: 1=Mon … 7=Sun
    if (cursor.weekday <= 5) count += 1;
    cursor = cursor.plus({ days: 1 });
  }
  return count;
};

/** Working days from mulai through min(today, selesai) — mirrors backend hariKerjaPeriode. */
export const hariKerjaEfektif = (
  tanggalMulai: string | null | undefined,
  tanggalSelesai: string | null | undefined,
  today = todayIsoDate()
): number => {
  const mulai = toDateInput(tanggalMulai);
  const selesai = toDateInput(tanggalSelesai);
  if (!mulai || !selesai) return 0;
  const end = selesai < today ? selesai : today;
  if (end < mulai) return 0;
  return countWeekdaysInclusive(mulai, end);
};
