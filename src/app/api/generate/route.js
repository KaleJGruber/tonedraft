import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { supabase } from "@/utils/supabase/client";

// ------------------------------------------------------------
// SAFE JSON PARSER — prevents 500s from messy model output
// ------------------------------------------------------------
function safeJSON(str) {
  try {
    const start = str.indexOf("{");
    const end = str.lastIndexOf("}");

    if (start === -1 || end === -1) {
      console.error("Invalid JSON from model:", str);
      return {};
    }

    const jsonString = str.slice(start, end + 1);
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("JSON parse error:", err, "Raw:", str);
    return {};
  }
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ------------------------------------------------------------
// EMAIL MODE — TWO STAGE PROMPTS
// ------------------------------------------------------------
const emailStage1Prompt = `...`; // unchanged
const essayStage1Prompt = `...`; // unchanged
const essayStage2Prompt = (toneProfile, stage1) => `...`; // unchanged
const postStage2Prompt = (toneProfile, stage1) => `...`; // unchanged

// ------------------------------------------------------------
// MAIN HANDLER
// ------------------------------------------------------------
export async function POST(req) {
  try {
    const { email, mode, toneProfile, toneSample, userId } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Missing email content" },
        { status: 400 }
      );
    }

    // USER FETCH
    let user = null;

    if (userId) {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      user = data || null;

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
    }

    // MONTHLY RESET
    if (userId && user) {
      const now = new Date();
      const lastReset = user.lastReset ? new Date(user.lastReset) : null;

      if (lastReset) {
        const daysSinceReset =
          (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceReset >= 30) {
          await supabase
            .from("users")
            .update({
              messagesUsed: 0,
              lastReset: now.toISOString(),
            })
            .eq("id", userId);

          user.messagesUsed = 0;
        }
      }
    }

    // FREE PLAN LIMIT
    if (userId && user && user.plan === "free" && user.messagesUsed >= 5) {
      return NextResponse.json(
        { error: "limit_reached", message: "Free monthly limit reached" },
        { status: 403 }
      );
    }

    // GROQ PIPELINES
    let parsed;

    if (mode === "email") {
      // EMAIL MODE
      const stage1 = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: emailStage1Prompt },
          { role: "user", content: `${toneSample}\n\n${email}` },
        ],
        temperature: 0,
      });

      let s1 = stage1.choices[0].message.content.trim();
      s1 = s1.replace(/```json/gi, "").replace(/```/g, "");
      const stage1Data = safeJSON(s1);

      const stage2 = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: essayStage2Prompt(toneProfile, stage1Data),
          },
          { role: "user", content: "Generate the JSON output." },
        ],
        temperature: 0.4,
      });

      let s2 = stage2.choices[0].message.content.trim();
      s2 = s2.replace(/```json/gi, "").replace(/```/g, "");
      parsed = safeJSON(s2);
    }

    else if (mode === "essay") {
      // ESSAY MODE
      const stage1 = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: essayStage1Prompt },
          { role: "user", content: email },
        ],
        temperature: 0,
      });

      let s1 = stage1.choices[0].message.content.trim();
      s1 = s1.replace(/```json/gi, "").replace(/```/g, "");
      const stage1Data = safeJSON(s1);

      const stage2 = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: essayStage2Prompt(toneProfile, stage1Data),
          },
          { role: "user", content: "Generate the JSON output." },
        ],
        temperature: 0.4,
      });

      let s2 = stage2.choices[0].message.content.trim();
      s2 = s2.replace(/```json/gi, "").replace(/```/g, "");
      parsed = safeJSON(s2);
    }

    else if (mode === "post") {
      // POST MODE
      const stage1 = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: postStage1Prompt },
          { role: "user", content: email },
        ],
        temperature: 0,
      });

      let s1 = stage1.choices[0].message.content.trim();
      s1 = s1.replace(/```json/gi, "").replace(/```/g, "");
      const stage1Data = safeJSON(s1);

      const stage2 = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: postStage2Prompt(toneProfile, stage1Data),
          },
          { role: "user", content: "Generate the JSON output." },
        ],
        temperature: 0.4,
      });

      let s2 = stage2.choices[0].message.content.trim();
      s2 = s2.replace(/```json/gi, "").replace(/```/g, "");
      parsed = safeJSON(s2);
    }

    else {
      return NextResponse.json(
        { error: "Invalid mode" },
        { status: 400 }
      );
    }

    // USAGE INCREMENT
    if (userId && user && user.plan === "free") {
      const currentUsed =
        typeof user.messagesUsed === "number" ? user.messagesUsed : 0;

      await supabase
        .from("users")
        .update({ messagesUsed: currentUsed + 1 })
        .eq("id", userId);
    }

    return NextResponse.json({
      summary: parsed?.summary || "",
      action: parsed?.action || "",
      reply: parsed?.reply || "",
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
