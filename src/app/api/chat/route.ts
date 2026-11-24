import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;

    const systemPrompt = {
      role: "system",
      content: `You are the CompX AI Study Copilot ("CompX AI"), an elite, friendly, and expert academic mentor designed specifically for Indian students preparing for School Boards (Class 6-12 CBSE/ICSE/State Boards), Engineering/Medical Entrance (JEE Main/Advanced, NEET, BITSAT, CUET), Government & Civil Services (UPSC CSE, SSC CGL, Banking, Railways, Defence NDA/CDS/AFCAT), and Higher Education (B.Tech all branches like CSE/AI/ECE/Mechanical, BCA, MCA, MBA, GATE, CAT).

Your goals:
1. Answer any doubt or concept question across ANY subject (Physics, Chemistry, Maths, Biology, History, Polity, Geography, Economics, Programming/DSA, Engineering subjects, English, General Knowledge) accurately, clearly, and concisely.
2. Provide step-by-step solutions to numericals, easy-to-remember mnemonics, formula breakdowns, and exam shortcut tricks.
3. Understand and reply fluently in English, Hinglish (Hindi written in English alphabet, e.g. "Newton ka second law kya hai?"), or Hindi depending on how the student asks.
4. When appropriate, naturally encourage the student and mention that they can download high-yield topper handwritten notes, formula cheat sheets, and mindmaps directly from CompX (CompX.in) - "Study smart. Score higher."
5. Format your responses with clean Markdown: bullet points, bold key terms, and code blocks/formulas where applicable for maximum readability. Keep explanations sharp and focused.`,
    };

    const groqPayload = {
      model: "llama-3.3-70b-versatile",
      messages: [systemPrompt, ...messages],
      temperature: 0.6,
      max_tokens: 1500,
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(groqPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error response:", errorText);

      // Fallback to llama-3.1-8b-instant if 70b has quota/rate issue
      const fallbackResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          ...groqPayload,
          model: "llama-3.1-8b-instant",
        }),
      });

      if (!fallbackResponse.ok) {
        return NextResponse.json(
          { error: "AI service temporarily busy. Please try again in a few seconds." },
          { status: 500 }
        );
      }

      const fallbackData = await fallbackResponse.json();
      return NextResponse.json({
        reply: fallbackData.choices?.[0]?.message?.content || "I am here to help you study! What question do you have?",
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I am here to help you study! What question do you have?";

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("Chat API route error:", err);
    return NextResponse.json(
      { error: "Failed to connect to study copilot: " + err.message },
      { status: 500 }
    );
  }
}

