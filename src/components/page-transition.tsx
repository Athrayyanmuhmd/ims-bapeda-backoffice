"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// ponytail: no `key={pathname}` here on purpose — forcing a remount on every
// route change (combined with the Suspense boundary in (protected)/layout.tsx
// for useSearchParams) triggered a React error #300 (hook-count mismatch) on
// every navigation in production. The fade now only plays on first mount.
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
