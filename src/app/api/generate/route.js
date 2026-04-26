import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

// ------------------------------------------------------------
// EMAIL MODE — TWO STAGE PROMPTS
// ------------------------------------------------------------
const emailStage1Prompt = `
You extract meaning from emails.

Your task:
1. Extract conceptual themes. These MUST reflect abstract patterns, structures, relationships, or interpretive frames implied by the prompt. This is the highest priority.
2. Summarize the user's intent in 1–2 sentences.
3. List any constraints the user explicitly stated.



Rules:
- You MUST extract conceptual, abstract, or analytical themes. Never return surface-level topics like "beauty," "calmness," "trees," "animals," "nature is important," or "humans and nature in

[Content blocked due to unsafe content detected]



[Content blocked due to unsafe content detected]

acing, rhythm, sentence length.
- No emojis. No code blocks.

Return ONLY valid JSON with keys: summary, action, reply.
`;

// ------------------------------------------------------------
// ESSAY MODE — TWO STAGE PROMPTS
// ------------------------------------------------------------
const essayStage1Prompt = `
You extract meaning from user writing prompts.

Your task:
1. Extract conceptual themes, not surface topics. Themes should reflect abstract patterns, structures, relationships, or interpretive frames implied by the prompt.
2. Summarize the user's intent in 1–2 sentences.
3. List any constraints the user explicitly stated.
4. If the user's tone profile is conceptual or analytical, extract the conceptual angle implied by the prompt.


Rules:
- You MUST extract conceptual, abstract, or analytical themes. Never return surface-level topics like "beauty," "calmness," "trees," "animals," or "nature is important."
- If the prompt is broad, vague, or generic, you MUST reinterpret it through the user's tone profile to extract conceptual, abstract, or analytical themes. Never return surface-level topics.
- Do NOT say the angle is unclear. Infer the conceptual angle from the tone profile.
- Do NOT infer factual content, but DO infer conceptual framing.
- Do NOT expand or elaborate beyond the user's intent.
- Do NOT generate a paragraph.
- Ignore summaries, suggested actions, or drafted replies.


Return ONLY valid JSON with keys: intent, themes, constraints.
`;

const essayStage2Prompt = (toneProfile, stage1) => `
You write academic-style paragraphs in the user's tone.

Tone Profile:
${JSON.stringify(toneProfile, null, 2)}

Meaning extracted from Stage 1:
${JSON.stringify(stage1, null, 2)}

Your job:
- Use ONLY the meaning from Stage 1 as the content source.
- Use the toneProfile as the stylistic source.
- Blend them: meaning = content, toneProfile = style.
- Do NOT copy any wording from the tone sample.
- Do NOT revert to generic academic tone.
- Do NOT add new ideas not present in the themes.
- Always write conceptually and analytically, not descriptively.

Output:
Return ONLY valid JSON with keys:
- summary: 1–2 sentence summary of the meaning
- action: the single most relevant next step
- reply: the final academic-style paragraph
`;

// ------------------------------------------------------------
// POST MODE — TWO STAGE PROMPTS
// ------------------------------------------------------------
const postStage1Prompt = `
You extract meaning from user writing prompts.

Your task:
1. Summarize the user's intent in 1–2 sentences.
2. List ONLY the key points the user wants included.
3. List any constraints the user explicitly stated.
4. Extract the tone of the user's sample writing (e.g., casual, chaotic, slangy, formal, dry, etc.).

Rules:
- Do NOT infer or guess.
- Do NOT generate a post.
- Ignore summaries, suggested actions, or drafted replies.

Return ONLY valid JSON with keys: intent, points, constraints, tone.
`;

const postStage2Prompt = (toneProfile, stage1) => `
You write short posts in the user's natural tone.

Tone Profile:
${JSON.stringify(toneProfile, null, 2)}

Use ONLY the structured meaning below:
${JSON.stringify(stage1, null, 2)}

Tasks:
1. Write a 1–2 sentence summary of the user's intent.
2. Suggest the single most relevant next action.
3. Draft a short post (max 4 sentences).

Rules:
- Match the tone extracted in Stage 1 unless the user explicitly overrides it.
- Do NOT copy wording from the tone profile.
- Do NOT add ideas not present in the points.
- No emojis unless the user naturally uses them.

Return ONLY valid JSON with keys: summary, action, reply.
`;

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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

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

    // MONTHLY RESET (only logged-in users)
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

    // FREE PLAN LIMIT (only logged-in users)
    if (userId && user && user.plan === "free" && user.messagesUsed >= 5) {
      return NextResponse.json(
        { error: "limit_reached", message: "Free monthly limit reached" },
        { status: 403 }
      );
    }

    // GROQ PIPELINES
    let parsed;

    // EMAIL MODE
    if (mode === "email") {
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

    // ESSAY MODE
    else if (mode === "essay") {
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

    // POST MODE
    else if (mode === "post") {
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

    // USAGE INCREMENT (only logged-in free users)
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
