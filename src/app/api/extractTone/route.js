import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { sample } = await req.json();

    if (!sample || sample.trim().length === 0) {
      return NextResponse.json(
        { error: "No writing sample provided" },
        { status: 400 }
      );
    }

    const prompt = `
    Analyze the user's writing sample and extract a detailed tone profile.

Your job is to describe the user's tone exactly as written, without elevating, formalizing, or interpreting it as more academic or analytical than it naturally is.

Only classify the writing as academic if the user's natural writing clearly demonstrates academic traits such as multi‑clause reasoning, conceptual framing, or analytical argumentation. 
Do NOT classify casual, humorous, conversational, or spontaneous writing as academic.

Prioritize detecting:
- overall tone (casual, conversational, academic, analytical, emotional, humorous, etc.)
- sentence structure complexity
- rhythm and pacing
- vocabulary sophistication
- emotionality vs analytical focus
- abstraction level (only if present)
- conceptual depth (only if present)
- sociological or philosophical framing (only if present)
- use of metaphor or conceptual language
- narrative distance (personal vs impersonal)
- formality level
- rhetorical style

Return ONLY a JSON object with keys:
{
  "formality": "",
  "sentence_length": "",
  "vocabulary": "",
  "voice": "",
  "pacing": "",
  "structure": "",
  "emotionality": "",
  "directness": "",
  "abstraction": "",
  "conceptual_depth": "",
  "academic_style": "",
  "rhetorical_style": "",
  "narrative_distance": ""
}

Do NOT rewrite the sample.
Do NOT give advice.
Do NOT add commentary.

You MUST distinguish between emotional content and emotional tone. 
Do NOT classify the writing as emotional simply because it references violence, desire, fear, or other emotional topics. 
Only classify the tone as emotional if the writer expresses personal feelings, vulnerability, or subjective emotional states. 
Analytical or academic discussion of emotional topics is NOT emotional tone.

Writing sample:
${sample}

`;


    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You analyze writing tone and output JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    let raw = completion.choices[0].message.content
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let toneProfile;
    try {
      toneProfile = JSON.parse(raw);
    } catch (err) {
      console.error("Tone JSON parse error:", raw);
      return NextResponse.json(
        { error: "Failed to parse tone profile", raw },
        { status: 500 }
      );
    }

    return NextResponse.json({ toneProfile });
  } catch (err) {
    console.error("Tone extraction error:", err);
    return NextResponse.json(
      { error: "Tone extraction failed" },
      { status: 500 }
    );
  }
}
