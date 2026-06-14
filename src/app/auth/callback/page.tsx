"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function finish() {
      // Exchange the code in the URL for a real session
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      // If successful, redirect the user into your app
      if (!error) {
        router.push("/premium");
      } else {
        console.error("Auth callback error:", error);
      }
    }

    finish();
  }, []);

  return <p>Confirming your account...</p>;
}
