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
    <form onSubmit={handleSignup}>
      <h1>Create Account</h1>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {infoMsg && <p style={{ color: "green" }}>{infoMsg}</p>}

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <button type="submit">Sign Up</button>
    </form>
  );
}
