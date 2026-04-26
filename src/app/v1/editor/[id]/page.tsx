"use client";

import { useEffect, useState } from "react";

export default function EditorWithId({ params }: { params: { id: string } }) {
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. LOAD THE DRAFT
  useEffect(() => {
    async function loadDraft() {
      const res = await fetch(`/api/drafts/${params.id}`, {
        cache: "no-store",
      });
      const json = await res.json();
      setDraft(json.data);
      setLoading(false);
    }

    loadDraft();
  }, [params.id]);

  // ⭐ MANUAL SAVE BUTTON HANDLER
  async function saveDraft() {
    await fetch(`/api/drafts/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draft.title,
        content: draft.content,
      }),
    });
  }

  // 2. AUTOSAVE
  useEffect(() => {
    if (!draft) return;

    const timeout = setTimeout(async () => {
      await fetch(`/api/drafts/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          content: draft.content,
        }),
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, [draft, params.id]);

  // 3. RENDER
  if (loading) return <div>Loading...</div>;
  if (!draft) return <div>Draft not found</div>;

  return (
    <div
      style={{
        padding: 40,
        maxWidth: 800,
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>Editing Draft</h1>

      <input
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        style={{ width: "100%", padding: 12, fontSize: 18, marginBottom: 20 }}
      />

      <textarea
        value={draft.content}
        onChange={(e) => setDraft({ ...draft, content: e.target.value })}
        style={{ width: "100%", height: 300, padding: 12, fontSize: 16 }}
      />

      <button
        onClick={saveDraft}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: 16,
          background: "black",
          color: "white",
          borderRadius: 6,
        }}
      >
        Save
      </button>
    </div>
  );
}
