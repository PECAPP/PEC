import { NextResponse } from "next/server";

const GITHUB_AI_BASE_URL =
  "https://models.github.ai/inference/chat/completions";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GITHUB_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GITHUB_AI_API_KEY is not configured on the server." },
        { status: 500 },
      );
    }

    const body = await req.json();
    const response = await fetch(GITHUB_AI_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const json = await response.json();
    if (!response.ok) {
      return NextResponse.json(json, { status: response.status });
    }

    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to proxy GitHub AI request.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
