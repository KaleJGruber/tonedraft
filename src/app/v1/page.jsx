"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/utils/supabase/client";
import { FreeMessageCounter } from "../components/FreeMessageCounter";
import Link from "next/link";

export default function V1Page() {
  const supabase = createBrowserClient();

  // ---------------- AUTH + PREMIUM ----------------
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [freeUsed, setFreeUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showToneModal, setShowToneModal] = useState(false);

  // ---------------- MAIN STATE ----------------
  const [mode, setMode] = useState("email");
  const [email, setEmail] = useState("");
  const [summary, setSummary] = useState("");
  const [action, setAction] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [toneSample, setToneSample] = useState("");

  // ---------------- FUNCTIONS ----------------
  async function generate() {
    console.log("Generate clicked");
    // TODO: Replace with your real API call
  }

  function copyReply() {
    if (reply) navigator.clipboard.writeText(reply);
  }

  function openInEditor() {
    window.location.href = `/v1/editor?content=${encodeURIComponent(reply)}`;
  }

  function handleSaveToneProfile() {
    console.log("Saving tone profile:", toneSample);
    setShowToneModal(false);
  }

  // ---------------- LOAD AUTH USER ----------------
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);
    }
    loadUser();
  }, []);

  // ---------------- FREE MESSAGE COUNTER ----------------
  useEffect(() => {
    const used = Number(localStorage.getItem("freeMessagesUsed") || 0);
    const lastReset = localStorage.getItem("freeMessagesLastReset");

    const now = new Date();
    const last = lastReset ? new Date(lastReset) : null;

    if (!last || (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24) >= 30) {
      localStorage.setItem("freeMessagesUsed", "0");
      localStorage.setItem("freeMessagesLastReset", now.toISOString());
      setFreeUsed(0);
    } else {
      setFreeUsed(used);
    }
  }, []);

  // ---------------- CHECK PREMIUM PLAN ----------------
  useEffect(() => {
    async function checkPlan() {
      if (!user) {
        setIsPremium(false);
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("plan")
        .eq("id", user.id)
        .single();

      setIsPremium(data?.plan === "premium");
    }

    checkPlan();
  }, [user]);

  // ---------------- UI ----------------
  return (
    <main
      style={{
        maxWidth: 700,
        margin: "40px auto",
        padding: "0 16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* HEADER + AUTH BAR */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <img src="/tonedraft-logo.png" alt="ToneDraft logo" style={{ height: 40 }} />
        <h1 style={{ fontSize: 30, fontWeight: 600, margin: 10 }}>ToneDraft - V1</h1>

        <div style={{ marginBottom: 20, display: "flex", gap: 30 }}>
          {!user && (
            <>
              <Link href="/login">
                <button
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "1px solid #ddd",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Log in
                </button>
              </Link>

              <Link href="/signup">
                <button
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "1px solid #ddd",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Sign up
                </button>
              </Link>
            </>
          )}

          {user && (
            <>
              <span style={{ fontWeight: 600 }}>{user.email}</span>

              <button
                onClick={() => supabase.auth.signOut()}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Log out
              </button>
            </>
          )}
        </div>
        
      </div>

      {/* VIEW DRAFTS */}
      <div style={{ marginBottom: 16 }}>
        <a href="/v1/drafts">
          <button
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid #ddd",
              backgroundColor: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            View Drafts
          </button>
        </a>
      </div>

      {/* CALIBRATE TONE */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setShowToneModal(true)}
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid #ddd",
            backgroundColor: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Calibrate Tone
        </button>
      </div>

      {/* UPGRADE BUTTON */}
      {user && !isPremium && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => (window.location.href = "/api/stripe/checkout")}
            style={{
              padding: "10px 16px",
              borderRadius: 999,
              border: "none",
              backgroundColor: "#4f46e5",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Upgrade to Premium
          </button>
        </div>
      )}

      {/* INSTRUCTIONS */}
      <p style={{ color: "#555", marginBottom: 24 }}>
        1. Paste Your Tone Sample… ToneDraft extracts your style automatically.
      </p>
      <p style={{ color: "#555", marginBottom: 24 }}>
        2. Write Your Prompt… ToneDraft blends your tone with the task.
      </p>
      <p style={{ color: "#555", marginBottom: 24 }}>
        3. Generate & Save… Review, edit, and save to your workspace.
      </p>

      {/* MODE SWITCH */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, marginTop: 16 }}>
        <button
          onClick={() => setMode("email")}
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid #ddd",
            backgroundColor: mode === "email" ? "#111827" : "white",
            color: mode === "email" ? "white" : "black",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Email Mode
        </button>

        <button
          onClick={() => setMode("essay")}
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid #ddd",
            backgroundColor: mode === "essay" ? "#111827" : "white",
            color: mode === "essay" ? "white" : "black",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Essay Mode
        </button>

        <button
          onClick={() => setMode("post")}
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid #ddd",
            backgroundColor: mode === "post" ? "#111827" : "white",
            color: mode === "post" ? "white" : "black",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Post Mode
        </button>
      </div>

      {/* PROMPT LABEL */}
      <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>
        {mode === "essay"
          ? "Essay Prompt"
          : mode === "post"
          ? "Post Prompt"
          : "Email"}
      </label>

      <FreeMessageCounter used={freeUsed} />

      {/* PROMPT TEXTAREA */}
      <textarea
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={
          mode === "essay"
            ? "Enter a prompt..."
            : mode === "post"
            ? "Describe the post you want to create..."
            : "Paste the email you want to reply to..."
        }
        style={{
          width: "100%",
          minHeight: 180,
          padding: 12,
          borderRadius: 8,
          border: "1px solid #ddd",
          fontSize: 14,
          resize: "vertical",
        }}
      />

      {/* GENERATE BUTTON */}
      <button
        onClick={generate}
        disabled={loading || !email.trim()}
        style={{
          marginTop: 16,
          padding: "10px 18px",
          borderRadius: 999,
          border: "none",
          backgroundColor: loading || !email.trim() ? "#ccc" : "#111827",
          color: "white",
          fontWeight: 600,
          cursor: loading || !email.trim() ? "default" : "pointer",
        }}
      >
        {loading
          ? "Thinking..."
          : mode === "essay"
          ? "Generate Paragraph"
          : mode === "post"
          ? "Generate Post"
          : "Generate Reply"}
      </button>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}

      {/* OUTPUT SECTION */}
      {(summary || action || reply) && (
        <section
          style={{
            marginTop: 32,
            padding: 20,
            borderRadius: 12,
            border: "1px solid #eee",
            backgroundColor: "#fafafa",
          }}
        >
          {summary && (
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, marginBottom: 4 }}>Summary</h2>
              <p>{summary}</p>
            </div>
          )}

          {action && (
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, marginBottom: 4 }}>Suggested Action</h2>
              <p>{action}</p>
            </div>
          )}

          {reply && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <h2 style={{ fontSize: 18, margin: 0 }}>Drafted Reply</h2>

                <button
                  onClick={copyReply}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: "1px solid #ddd",
                    backgroundColor: "white",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Copy
                </button>

                <button
                  type="button"
                  onClick={openInEditor}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: "1px solid #ddd",
                    backgroundColor: "white",
                    fontSize: 12,
                    cursor: "pointer",
                    marginLeft: 8,
                  }}
                >
                  Open in Editor
                </button>
              </div>

              <pre
                style={{
                  marginTop: 8,
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  fontSize: 14,
                }}
              >
                {reply}
              </pre>
            </div>
          )}
        </section>
      )}

      {/* TONE MODAL */}
      {showToneModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 24,
              borderRadius: 12,
              width: 450,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
              Calibrate Your Tone
            </h2>

            <p style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>
              Paste one writing sample you’ve written that feels like your desired text.
            </p>

            <textarea
              value={toneSample}
              onChange={(e) => setToneSample(e.target.value)}
              placeholder="Paste your writing sample here..."
              style={{
                width: "100%",
                height: 150,
                padding: 12,
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 14,
                resize: "vertical",
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button
                onClick={() => setShowToneModal(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                  cursor: "pointer",
                  marginRight: 8,
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleSaveToneProfile}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "none",
                  backgroundColor: "#111827",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Save Tone Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
