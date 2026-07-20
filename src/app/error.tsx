"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-xl font-semibold">Terjadi kesalahan</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        {error.message || "Halaman gagal dimuat. Coba muat ulang."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium"
      >
        Coba lagi
      </button>
    </div>
  );
}
