"use client";

import { RequireRole } from "@/components/require-role";
import TableManajemenDivisi from "./table";

export default function Container() {
  return (
    <RequireRole role="Admin">
      <TableManajemenDivisi />
    </RequireRole>
  );
}
