"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    router.push("/premium");
  }

  return (
    <form onSubmit={handleLogin}>
      <h1>Log In</h1>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        required
      />

      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <button type="submit">Log In</button>
    </form>
  );
}
