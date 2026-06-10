"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function handleCallback() {
      // Just touching the session is enough to finalize the email confirmation
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      if (data.session) {
        router.push("/premium"); // or "/" if you prefer
      } else {
        setErrorMsg("No active session. Try logging in.");
      }
    }

    handleCallback();
  }, [router, supabase]);

  if (errorMsg) {
    return <p style={{ color: "red" }}>{errorMsg}</p>;
  }

  return <p>Confirming your account...</p>;
}
