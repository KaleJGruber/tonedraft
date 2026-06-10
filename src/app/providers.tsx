"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const { id, email } = session.user;

          await supabase.from("users").upsert({
            id,
            email,
          });
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
