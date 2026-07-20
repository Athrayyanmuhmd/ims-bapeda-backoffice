"use client";

import { RequireRole } from "@/components/require-role";
import TableManajemenInstansi from "./table";

export default function Container() {
  return (
    <RequireRole role="Admin">
      <TableManajemenInstansi />
    </RequireRole>
  );
}
