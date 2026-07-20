// Centralized query key registry. Every useQuery/invalidateQueries call in the
// app should build its key from here instead of hand-writing arrays — that's
// what caught the dashboard firing the same "latest 100 peserta" and "latest
// 100 absensi" requests twice under different labels (["peserta-magang","stats"]
// vs ["peserta-magang","options"], ["absensi","today"] vs ["absensi","month"]).
// Same query, same key, one shared cache entry.

export const queryKeys = {
  pesertaMagang: {
    all: ["peserta-magang"] as const,
    list: (params: unknown) => [...queryKeys.pesertaMagang.all, "list", params] as const,
    detail: (id: string) => [...queryKeys.pesertaMagang.all, "detail", id] as const,
    // rows:100 lookup shared by every "pick a peserta" dropdown and the dashboard summary cards.
    lookup: () => [...queryKeys.pesertaMagang.all, "lookup"] as const,
    // rows:200, used only by the daily absensi roster which needs every active peserta, not a capped list.
    roster: () => [...queryKeys.pesertaMagang.all, "roster"] as const,
  },
  absensi: {
    all: ["absensi"] as const,
    list: (params: unknown) => [...queryKeys.absensi.all, "list", params] as const,
    // rows:100 latest-desc, shared by every dashboard widget that needs "recent attendance".
    recent: () => [...queryKeys.absensi.all, "recent"] as const,
    rosterByDate: (date: string) => [...queryKeys.absensi.all, "roster", date] as const,
    byPeserta: (pesertaId: string) => [...queryKeys.absensi.all, "by-peserta", pesertaId] as const,
  },
  jurnal: {
    all: ["jurnal"] as const,
    list: (params: unknown) => [...queryKeys.jurnal.all, "list", params] as const,
    byPeserta: (pesertaId: string) => [...queryKeys.jurnal.all, "by-peserta", pesertaId] as const,
  },
  penilaian: {
    all: ["penilaian"] as const,
    list: (params: unknown) => [...queryKeys.penilaian.all, "list", params] as const,
    byPeserta: (pesertaId: string) => [...queryKeys.penilaian.all, "by-peserta", pesertaId] as const,
  },
  dokumen: {
    all: ["dokumen"] as const,
    list: (params: unknown) => [...queryKeys.dokumen.all, "list", params] as const,
    byPeserta: (pesertaId: string) => [...queryKeys.dokumen.all, "by-peserta", pesertaId] as const,
  },
  instansi: {
    all: ["instansi"] as const,
    list: (params: unknown) => [...queryKeys.instansi.all, "list", params] as const,
    options: () => [...queryKeys.instansi.all, "options"] as const,
  },
  divisi: {
    all: ["divisi"] as const,
    list: (params: unknown) => [...queryKeys.divisi.all, "list", params] as const,
    options: () => [...queryKeys.divisi.all, "options"] as const,
  },
  role: {
    all: ["role"] as const,
    list: (params: unknown) => [...queryKeys.role.all, "list", params] as const,
    options: () => [...queryKeys.role.all, "options"] as const,
  },
  user: {
    all: ["user"] as const,
    list: (params: unknown) => [...queryKeys.user.all, "list", params] as const,
    options: () => [...queryKeys.user.all, "options"] as const,
  },
} as const;
