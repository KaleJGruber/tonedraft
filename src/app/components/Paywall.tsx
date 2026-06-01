"use client";

import { useState, useEffect, useRef } from "react";

export default function Paywall() {
  const inputRef = useRef<HTMLInputElement>(null);

  const startCheckout = async () => {
    const email = inputRef.current?.value?.trim();

    if (!email) {
      alert("Please enter your email first.");
      return;
    }

    // Save email locally
    localStorage.setItem("td-email", email);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }), // ⭐ ALWAYS SENT
    });

    const data = await res.json();

    if (!data.url) {
      alert("Checkout failed. Please try again.");
      return;
    }

    window.location.href = data.url;
  };

  return (
    <main
      style={{
        maxWidth: 700,
        margin: "40px auto",
        padding: "0 16px",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
      }}
    >
      <img
        src="/tonedraft-logo.png"
        alt="ToneDraft logo"
        style={{ height: 100 }}
      />

      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 12 }}>
        Free Limit Reached
      </h1>

      <p style={{ color: "#555", marginBottom: 28, lineHeight: 1.5 }}>
        You've used your 5 free messages this month.
        Upgrade to continue generating drafts, summaries, and tone‑matched replies.
      </p>

      {/* Email Input */}
      <input
        ref={inputRef}
        type="email"
        placeholder="Enter your email"
        defaultValue={typeof window !== "undefined" ? localStorage.getItem("td-email") || "" : ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") startCheckout(); // ⭐ ENTER WORKS
        }}
        style={{
          width: "100%",
          padding: "12px 18px",
          borderRadius: 999,
          border: "1px solid #ddd",
          marginBottom: 12,
          fontSize: 15,
        }}
      />

      {/* Upgrade Button */}
      <button
        onClick={startCheckout}
        style={{
          width: "100%",
          padding: "12px 18px",
          borderRadius: 999,
          border: "1px solid #ddd",
          backgroundColor: "#f5f5f5",
          color: "#333",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Upgrade to Premium
      </button>

      <div style={{ height: 12 }} />

      {/* Redeem Button */}
      <button
        onClick={async () => {
          const res = await fetch("/api/redeem", { method: "POST" });
          const { url } = await res.json();
          window.location.href = url;
        }}
        style={{
          width: "100%",
          padding: "12px 18px",
          borderRadius: 999,
          border: "1px solid #ddd",
          backgroundColor: "#f5f5f5",
          color: "#333",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Redeem Existing Purchase
      </button>

      <p style={{ color: "#999", fontSize: 12, marginTop: 20 }}>
        Your free messages reset every 30 days.
      </p>
    </main>
  );
}
