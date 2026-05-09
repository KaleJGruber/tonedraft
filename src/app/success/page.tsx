"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SuccessPage() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const email = params.get("email");

    if (email) {
      localStorage.setItem("userEmail", email);
    }

    router.push("/v1");
  }, []);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>Upgrading your account…</h1>
      <p style={{ marginTop: 8, color: "#555" }}>Just a moment.</p>
    </div>
  );
}
