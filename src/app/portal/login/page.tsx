import { redirect } from "next/navigation";

// Bookmark lama /portal/login → satu pintu masuk di /login.
export default function Page() {
  redirect("/login");
}
