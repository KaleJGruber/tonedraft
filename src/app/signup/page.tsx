"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [infoMsg, setInfoMsg] = useState<string>("");

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://tonedraft.vercel.app/auth/callback",
      },
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setInfoMsg("Check your email to confirm your account.");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSignup}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "white",
          padding: "32px 28px",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          Create Account
        </h1>

        {errorMsg && (
          <p style={{ color: "red", fontSize: 14 }}>{errorMsg}</p>
        )}

        {infoMsg && (
          <p style={{ color: "green", fontSize: 14 }}>{infoMsg}</p>
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
          style={{
            padding: "12px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 15,
          }}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={{
            padding: "12px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 15,
          }}
        />

        <button
          type="submit"
          style={{
            marginTop: 6,
            padding: "12px 14px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#111",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          Sign Up
        </button>

        <p style={{ marginTop: 10, fontSize: 14, textAlign: "center" }}>
          Already have an account?{" "}
          <a href="/login" style={{ fontWeight: 600 }}>
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}
