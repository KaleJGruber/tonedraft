"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function finish() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      if (data.session) {
        router.push("/premium");
      } else {
        setErrorMsg("No active session. Try logging in.");
      }
    }

    finish();
  }, []);

  if (errorMsg) return <p style={{ color: "red" }}>{errorMsg}</p>;

  return <p>Confirming your account...</p>;
}
