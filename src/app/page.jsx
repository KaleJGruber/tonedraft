"use client";

import { useEffect, useState } from "react";
import { FreeMessageCounter } from "./components/FreeMessageCounter";



export default function Home() {
  const [freeUsed, setFreeUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load anonymous usage from localStorage
  useEffect(() => {
    const used = Number(localStorage.getItem("freeMessagesUsed") || 0);
    const lastReset = localStorage.getItem("freeMessagesLastReset");

    const now = new Date();
    const last = lastReset ? new Date(lastReset) : null;

    // Monthly reset
    if (!last || (now - last) / (1000 * 60 * 60 * 24) >= 30) {
      localStorage.setItem("freeMessagesUsed", "0");
      localStorage.setItem("freeMessagesLastReset", now.toISOString());
      setFreeUsed(0);
    } else {
      setFreeUsed(used);
    }

    setIsLoading(false);
  }, []);

  async function handleGenerate() {
    // Anonymous user limit
    if (freeUsed >= 5) {
      alert("You've used all 5 free messages. Create an account to continue.");
      return;
    }

    // Increment local usage
    const newUsed = freeUsed + 1;
    localStorage.setItem("freeMessagesUsed", newUsed.toString());
    setFreeUsed(newUsed);

    // Call your API route (anonymous mode)
    const res = await fetch("/api/generate", {
      method: "POST",
      body: JSON.stringify({
        email: "test",
        mode: "email",
        toneProfile: {},
        toneSample: "",
        userId: null, // anonymous
      }),
    });

    const data = await res.json();
    console.log("Generated:", data);
  }

  if (isLoading) return null;

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ToneDraft</h1>

      <FreeMessageCounter used={freeUsed} />

      <button
        onClick={handleGenerate}
        className="mt-6 bg-black text-white px-4 py-2 rounded"
      >
        Generate
      </button>

      {freeUsed >= 5 && (
        <div className="mt-4 text-sm text-gray-600">
          You’ve reached your free limit.  
          <button
            onClick={() => window.location.href = "/signup"}
            className="underline ml-1"
          >
            Create an account to continue
          </button>
        </div>
      )}
    </div>
  );
}
