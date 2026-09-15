"use client";

import { useEffect } from "react";

const CHUNK_RELOAD_KEY = "simagang:chunk-reload";

function isChunkLoadError(error: Error) {
  return (
    error.name === "ChunkLoadError" ||
    /loading chunk|failed to load chunk|importing a module script failed/i.test(error.message || "")
  );
}

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (!isChunkLoadError(error)) return;
    if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === "1") {
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      return;
    }
    sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
    window.location.reload();
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-xl font-semibold">Terjadi kesalahan</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        {error.message || "Halaman gagal dimuat. Coba muat ulang."}
      </p>
      <button
        type="button"
        onClick={() => {
          sessionStorage.removeItem(CHUNK_RELOAD_KEY);
          window.location.reload();
        }}
        className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium"
      >
        Muat ulang
      </button>
    </div>
  );
}
