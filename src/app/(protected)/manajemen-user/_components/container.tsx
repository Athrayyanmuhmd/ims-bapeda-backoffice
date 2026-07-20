"use client";

import { RequireRole } from "@/components/require-role";
import TableManajemenUser from "./table";

export default function Container() {
  return (
    <RequireRole role="Admin">
      <TableManajemenUser />
    </RequireRole>
  );
}
