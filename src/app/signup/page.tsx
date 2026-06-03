"use client";

import { useState } from "react";
import { createBrowserClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const supabase = createBrowserClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
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
    <form onSubmit={handleSignup}>
      <h1>Create Account</h1>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
      />

      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
      />

      <button type="submit">Sign Up</button>
    </form>
  );
}
