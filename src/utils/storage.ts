import { randomUUID } from "node:crypto";

// Supabase Storage over its plain REST API — the whole integration is two
// fetches, so it isn't worth pulling in @supabase/supabase-js for.
//
// The bucket is expected to be PRIVATE: documents hold personal data (nama,
// NIM, surat, sertifikat), so nothing is served from a public URL. Reads go
// through /api/dokumen/download, which mints a short-lived signed URL.

const STORAGE_UNCONFIGURED =
  "Upload file belum aktif: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diset. " +
  "Sementara bisa tempel link file secara manual.";

const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "doc", "docx"] as const;

// ponytail: the file is proxied through this app, so it's bounded by the
// serverless request body limit (4.5MB on Vercel) rather than by Supabase.
// If bigger scans need uploading, switch to a Supabase signed *upload* URL and
// have the browser PUT straight to storage.
const MAX_BYTES = 4 * 1024 * 1024;

type StorageConfig = { url: string; key: string; bucket: string };

const config = (): StorageConfig | null => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!(url && key)) return null;

  return { url: url.replace(/\/$/, ""), key, bucket: process.env.SUPABASE_BUCKET ?? "dokumen" };
};

export const isStorageConfigured = () => config() !== null;

const extensionOf = (filename: string) => filename.split(".").pop()?.toLowerCase() ?? "";

export type UploadResult = { ok: true; path: string } | { ok: false; message: string };

export const uploadDokumen = async (file: File): Promise<UploadResult> => {
  const cfg = config();
  if (!cfg) return { ok: false, message: STORAGE_UNCONFIGURED };

  if (file.size === 0) return { ok: false, message: "File kosong" };
  if (file.size > MAX_BYTES) {
    return { ok: false, message: `Ukuran file maksimal ${MAX_BYTES / 1024 / 1024}MB` };
  }

  const extension = extensionOf(file.name);
  if (!ALLOWED_EXTENSIONS.includes(extension as (typeof ALLOWED_EXTENSIONS)[number])) {
    return {
      ok: false,
      message: `Format file harus salah satu dari: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  // Random name, original name never used as a path: it would otherwise carry
  // traversal segments and collide between peserta.
  const path = `${randomUUID()}.${extension}`;

  const response = await fetch(`${cfg.url}/storage/v1/object/${cfg.bucket}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": file.type || "application/octet-stream",
    },
    body: await file.arrayBuffer(),
  });

  if (!response.ok) {
    console.error("Supabase upload failed", response.status, await response.text());
    return { ok: false, message: "Gagal mengunggah file ke storage" };
  }

  return { ok: true, path };
};

export const signedDokumenUrl = async (path: string, expiresIn = 60): Promise<string | null> => {
  const cfg = config();
  if (!cfg) return null;

  const response = await fetch(`${cfg.url}/storage/v1/object/sign/${cfg.bucket}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn }),
  });

  if (!response.ok) {
    console.error("Supabase sign failed", response.status, await response.text());
    return null;
  }

  const { signedURL } = (await response.json()) as { signedURL?: string };
  return signedURL ? `${cfg.url}/storage/v1${signedURL}` : null;
};
