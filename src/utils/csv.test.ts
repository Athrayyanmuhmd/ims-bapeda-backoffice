import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

interface Row {
  name: string;
  note: string | null;
}

const columns = [
  { header: "Nama", value: (r: Row) => r.name },
  { header: "Keterangan", value: (r: Row) => r.note },
];

describe("toCsv", () => {
  it("writes a header row followed by CRLF-separated data rows", () => {
    const csv = toCsv([{ name: "Andi", note: "Hadir" }], columns);

    expect(csv).toBe("Nama,Keterangan\r\nAndi,Hadir");
  });

  it("renders null and undefined as empty cells", () => {
    const csv = toCsv([{ name: "Andi", note: null }], columns);

    expect(csv).toBe("Nama,Keterangan\r\nAndi,");
  });

  it("quotes cells containing a comma", () => {
    const csv = toCsv([{ name: "Pratama, Andi", note: "Hadir" }], columns);

    expect(csv).toBe('Nama,Keterangan\r\n"Pratama, Andi",Hadir');
  });

  it("quotes and doubles embedded quotes", () => {
    const csv = toCsv([{ name: 'Andi "Bang" P', note: null }], columns);

    expect(csv).toBe('Nama,Keterangan\r\n"Andi ""Bang"" P",');
  });

  it("quotes cells containing newlines so one record stays one record", () => {
    const csv = toCsv([{ name: "Andi", note: "Izin\ndokter" }], columns);

    expect(csv).toBe('Nama,Keterangan\r\nAndi,"Izin\ndokter"');
  });

  // Without this a keterangan starting with = is executed by Excel on open.
  it("neutralises cells Excel would treat as a formula", () => {
    const csv = toCsv([{ name: "=1+1", note: "@SUM(A1)" }], columns);

    expect(csv).toBe("Nama,Keterangan\r\n'=1+1,'@SUM(A1)");
  });

  it("still emits the header when there are no rows", () => {
    expect(toCsv([], columns)).toBe("Nama,Keterangan");
  });
});
