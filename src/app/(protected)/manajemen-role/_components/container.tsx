"use client";

import { RequireRole } from "@/components/require-role";
import TableManajemenRole from "./table";

export default function Container() {
  return (
    <RequireRole allowedRole="Admin">
      <TableManajemenRole />
    </RequireRole>
  );
}
