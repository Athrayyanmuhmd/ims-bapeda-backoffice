# SIMAGANG Backoffice

Backoffice (panel admin) untuk sistem manajemen magang Bapeda. Mengonsumsi REST API
dari `ims-bapeda-backend`.

## Tech Stack
- Next.js 16 (App Router) + React 19
- TanStack Query + Axios
- Tailwind CSS v4 + shadcn/ui
- React Hook Form + Zod
- Biome (lint & format), Vitest (test)

## Setup

### 1. Install dependencies
```bash
pnpm install
```

### 2. Konfigurasi environment
Copy `.env.example` menjadi `.env.local`, lalu sesuaikan:

```env
NEXT_PUBLIC_FE_URL=http://localhost:3000
NEXT_PUBLIC_BE_URL=http://localhost:3001
```

### 3. Jalankan
```bash
pnpm dev
```

Buka `http://localhost:3000` (root otomatis redirect ke `/login`).

## Upload Dokumen (Supabase Storage)

Fitur unggah file pada halaman **Dokumen** memakai Supabase Storage. Tanpa
konfigurasi di bawah, aplikasi tetap jalan — hanya saja upload dimatikan dan
dokumen harus diisi dengan menempel link manual (mis. Google Drive).

### 1. Buat bucket
Di Supabase Dashboard → **Storage** → **New bucket**:
- Name: `dokumen`
- **Public bucket: NONAKTIF** (biarkan private)

Bucket sengaja private karena dokumen memuat data pribadi (nama, NIM, surat,
sertifikat). Setiap pembacaan dilewatkan `/api/dokumen/download`, yang memeriksa
sesi login lalu redirect ke signed URL berumur 60 detik.

### 2. Tambahkan environment variables
```env
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_BUCKET=dokumen
```

`SUPABASE_SERVICE_ROLE_KEY` **hanya dipakai di server** (route handler) dan tidak
boleh diberi prefix `NEXT_PUBLIC_`. Ambil dari Supabase Dashboard → Project
Settings → API Keys → `service_role`.

Batas ukuran file: **4MB** (file diproxy lewat serverless function). Format yang
diterima: PDF, JPG, PNG, DOC, DOCX.

## Fitur

| Halaman | Keterangan |
|---|---|
| Dashboard | Ringkasan absensi hari ini, statistik, dan daftar **magang segera berakhir** |
| Peserta Magang | CRUD peserta + halaman detail + **Cetak Laporan** (print/PDF) |
| Absensi | Roster harian, riwayat, dan **Export CSV** per rentang tanggal |
| Jurnal | Catatan kegiatan harian peserta |
| Penilaian | Nilai & komentar dari pembimbing |
| Dokumen | Unggah / tempel link dokumen peserta |
| Manajemen* | User, Divisi, Instansi, Role — khusus role Admin |

### Cetak laporan magang
`/peserta-magang/[id]/cetak` menghasilkan dokumen siap cetak berisi identitas
peserta, rekap kehadiran, jurnal kegiatan, penilaian, dan blok tanda tangan.
Tombol **Cetak / Simpan PDF** memakai dialog print browser — tidak ada dependency
PDF tambahan. Sidebar dan tombol otomatis disembunyikan saat print (lihat aturan
`@media print` di `src/styles/globals.css`).

## Perintah

```bash
pnpm dev        # development server
pnpm build      # production build
pnpm lint       # biome check
pnpm format     # biome format --write
pnpm test       # vitest
```

## Catatan

- Role disembunyikan di navigasi lewat `roles` di `src/constants/navigation.ts`,
  tetapi penegakan hak akses yang sebenarnya ada di backend (lihat README backend).
- `pnpm lint` bersih dari error dan sudah menjadi gate di CI. Masih ada ~46
  *warning* yang dibiarkan karena aturannya tidak cocok dengan kode ini:
  `useNamingConvention` memprotes hal-hal yang formatnya ditentukan pihak lain
  (nama export route Next `GET`/`POST`, variabel `NEXT_PUBLIC_*`, nilai enum
  Prisma seperti `SURAT_PENGANTAR`, header HTTP `Authorization`), dan
  `noArrayIndexKey` memprotes daftar skeleton statis yang indeksnya memang
  identitasnya.
