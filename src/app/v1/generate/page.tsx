"use client";

import { useState } from "react";

export default function GeneratePage() {
  // ⭐ NEW — separate tone sample and prompt
  const [toneSample, setToneSample] = useState("");
  const [prompt, setPrompt] = useState("");

  // Existing state
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateReply() {
    setLoading(true);
    setReply("");

    try {
      // -----------------------------
      // 1. Extract Tone (from toneSample ONLY)
      // -----------------------------
      const toneRes = await fetch("/api/extractTone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sample: toneSample, // ⭐ FIXED
        }),
      });

      const toneData = await toneRes.json();

      if (!toneRes.ok) {
        console.error("Tone extraction failed:", toneData);
        setReply("Tone extraction failed.");
        setLoading(false);
        return;
      }

      // -----------------------------
      // 2. Generate Output (using prompt + toneSample)
      // -----------------------------
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: prompt,            // ⭐ FIXED — this is the actual prompt
          mode: "post",             // or "email" or "essay"
          toneProfile: toneData.toneProfile,
          toneSample: toneSample,   // ⭐ FIXED — real tone sample
        }),
      });

      const data = await res.json();
      setReply(data.reply || "");
    } catch (err) {
      console.error("Generation error:", err);
      setReply("An error occurred while generating.");
    }

    setLoading(false);
  }

  async function openInEditor(generatedText: string) {

    const res = await fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Generated Draft",
        content: generatedText,
      }),
    });

    const json = await res.json();
    window.location.href = `/v1/editor/${json.data.id}`;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px" }}>
      <h1 style={{ marginBottom: "20px" }}>VoiceDraft — Generate</h1>

      <a href="/v1/drafts">
        <button
          style={{
            marginBottom: "20px",
            padding: "10px 20px",
            background: "#eee",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          View Drafts
        </button>
      </a>

      {/* ⭐ NEW — Tone Sample Input */}
      <textarea
        value={toneSample}
        onChange={(e) => setToneSample(e.target.value)}
        placeholder="Paste your tone sample here..."
        style={{
          width: "100%",
          height: "120px",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "20px",
          fontSize: "16px",
        }}
      />

      {/* ⭐ NEW — Prompt Input */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Write your prompt here..."
        style={{
          width: "100%",
          height: "150px",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "20px",
          fontSize: "16px",
        }}
      />

      <button
        onClick={generateReply}
        disabled={loading || !prompt.trim() || !toneSample.trim()}
        style={{
          padding: "12px 24px",
          background: "black",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {reply && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fafafa",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>Generated Reply</h3>

          <div style={{ whiteSpace: "pre-wrap", marginBottom: "20px" }}>
            {reply}
          </div>

          <button
            onClick={() => openInEditor(reply)}
            style={{
              padding: "10px 20px",
              background: "black",
              color: "white",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Open in Editor
          </button>
        </div>
      )}
    </div>
  );
}
