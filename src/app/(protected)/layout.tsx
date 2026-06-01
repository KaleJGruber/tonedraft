import { createClient } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
