"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type React from "react";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import { ConfigProvider, type TConfig } from "@/stores/config";

type TProvidersProps = {
  children: React.ReactNode;
  config: TConfig;
};

interface ApiError {
  message?: string;
  status?: number;
}

// 401s are already handled by the axios interceptor (session gets cleared and
// the user is bounced to /login), so surfacing them again here would just be
// a duplicate, confusing toast on top of the redirect.
const shouldToast = (error: ApiError) => error.status !== 401;

export default function Providers({ children, config }: TProvidersProps) {
  const [queryClient] = useState(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 3 * 60 * 1000,
          gcTime: 5 * 60 * 1000,
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
          retry: (failureCount, error) => {
            const status = (error as ApiError)?.status;
            // Client errors (400/403/404/...) won't fix themselves on retry —
            // only retry transient failures (network drop, 5xx) and cap it
            // low so a real outage fails fast instead of hanging the UI.
            if (status && status >= 400 && status < 500) return false;
            return failureCount < 2;
          },
        },
        mutations: {
          // Never auto-retry a write — a flaky retry on a POST/PUT risks
          // creating or updating the same record twice.
          retry: false,
        },
      },
      // useQuery lost its per-call onError in v5, which meant a failed GET
      // anywhere in the app failed completely silently (empty table, no
      // toast, nothing). This is the one place that gap gets closed for
      // every query in the app at once.
      queryCache: new QueryCache({
        onError: (error) => {
          const apiError = error as ApiError;
          if (shouldToast(apiError)) {
            toast.error(apiError.message || "Gagal memuat data, coba lagi.");
          }
        },
      }),
      // Individual mutations already toast their own errors with
      // context-specific messages — this is only a safety net for the rare
      // mutation that forgets to.
      mutationCache: new MutationCache({
        onError: (error, _variables, _context, mutation) => {
          if (mutation.options.onError) return;
          const apiError = error as ApiError;
          if (shouldToast(apiError)) {
            toast.error(apiError.message || "Terjadi kesalahan, coba lagi.");
          }
        },
      }),
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider config={config}>
        <Toaster position="top-center" richColors />
        {children}
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
      </ConfigProvider>
    </QueryClientProvider>
  );
}
