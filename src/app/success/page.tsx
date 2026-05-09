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

    // Redirect into the app
    router.push("/");
  }, []);

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Processing your upgrade…</h1>
      <p className="text-gray-500 mt-2">Just a moment.</p>
    </div>
  );
}
