// CSV is built here rather than on the API so the exported values go through
// exactly the same luxon formatting the tables use — a rekap that disagrees
// with what the operator sees on screen is worse than no rekap.

// RFC 4180: a field needs quoting if it contains a comma, quote, CR or LF, and
// embedded quotes are doubled.
const escapeCell = (value: unknown): string => {
  if (value === null || value === undefined) return "";

  const text = String(value);

  // A leading =, +, - or @ makes Excel treat the cell as a formula. Prefix with
  // an apostrophe so a name like "-Andi" can't execute anything on open.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;

  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => unknown;
}

export const toCsv = <T>(rows: T[], columns: CsvColumn<T>[]): string =>
  [
    columns.map((column) => escapeCell(column.header)).join(","),
    ...rows.map((row) => columns.map((column) => escapeCell(column.value(row))).join(",")),
  ].join("\r\n");

export const downloadCsv = (filename: string, csv: string) => {
  // Leading BOM so Excel opens it as UTF-8 instead of the system codepage.
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};
