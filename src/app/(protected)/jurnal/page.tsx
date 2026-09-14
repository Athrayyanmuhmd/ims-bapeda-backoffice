import { redirect } from "next/navigation";

// Old /jurnal bookmarks land here after the Logbook rename.
export default function Page() {
  redirect("/logbook");
}
