import { NextResponse } from "next/server";
import { getSession } from "@/utils/session";
import { uploadDokumen } from "@/utils/storage";
import { verifyStaffToken } from "@/utils/verify-staff-token";

// Upload runs here rather than on the API backend because a route handler gets
// multipart parsing for free (Web FormData) — no multer/busboy needed. The
// stored document row still goes through the backend's /dokumen/create.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const verified = await verifyStaffToken(session.accessToken);
  if (!verified.ok) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (verified.role !== "Admin" && verified.role !== "Pembimbing") {
    return NextResponse.json({ message: "Anda tidak memiliki akses untuk aksi ini" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "File wajib diunggah" }, { status: 400 });
  }

  const result = await uploadDokumen(file);
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  // Relative on purpose: stored in Dokumen.urlFile, so it must survive a
  // domain change. The existing "Buka" links render it as a plain href.
  return NextResponse.json({
    urlFile: `/api/dokumen/download?path=${encodeURIComponent(result.path)}`,
    namaFile: file.name,
  });
}
