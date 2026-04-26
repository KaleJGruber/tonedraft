"use client";

import { createBrowserClient } from "@/utils/supabase/client";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const supabase = createBrowserClient();

  useEffect(() => {
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
