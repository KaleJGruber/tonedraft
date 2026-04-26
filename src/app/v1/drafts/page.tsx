"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDrafts() {
      const res = await fetch("/api/drafts");
      const json = await res.json();
      setDrafts(json.data || []);
      setLoading(false);
    }
    loadDrafts();
  }, []);

  return (
    <div
  style={{
    maxWidth: 650,
    margin: "0 auto",
    padding: "50px 20px",
    textAlign: "center",
    fontFamily: "system-ui, sans-serif",   // ← add this line
  }}


    >
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
  <img
    src="/tonedraft-logo.png"
    alt="ToneDraft logo"
    style={{ height: 40 }}
  />
  <h1 style={{ fontSize: 30, fontWeight: 600, margin: 0 }}>ToneDraft – V1</h1>
</div>

      
      

      {/* Top Navigation */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          marginBottom: 45,
        }}
      >
        <Link href="/v1/drafts" style={{ textDecoration: "none" }}>
          
        </Link>

        <Link href="/v1/calibrate" style={{ textDecoration: "none" }}>
          
        </Link>
      </div>

      {/* Section Label */}
      <div
        style={{
          fontSize: 20,
          fontWeight: 500,
          marginBottom: 25,
        }}
      >
        Your Drafts
      </div>

      {/* Draft List */}
      {loading ? (
        <div style={{ opacity: 0.6 }}>Loading drafts…</div>
      ) : drafts.length === 0 ? (
        <div style={{ opacity: 0.6 }}>No drafts yet.</div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            marginTop: 10,
          }}
        >
          {drafts.map((d) => (
            <Link
              key={d.id}
              href={`/v1/editor/${d.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  padding: "18px 22px",
                  border: "1px solid #e5e5e5",
                  borderRadius: 10,
                  background: "#fafafa",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 18, marginBottom: 6 }}>
                  {d.title || "Untitled Draft"}
                </div>
                <div style={{ opacity: 0.6, fontSize: 14 }}>
                  {d.preview || "No preview available"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
