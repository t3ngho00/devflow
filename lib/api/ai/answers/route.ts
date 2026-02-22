import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import z from "zod";

import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import { AIAnswerSchema } from "@/lib/validation";

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  const { question, content, userAnswer } = await req.json();

  try {
    const validatedData = AIAnswerSchema.safeParse({ question, content });
    if (!validatedData.success)
      throw new ValidationError(
        z.treeifyError(validatedData.error) as unknown as Record<
          string,
          string[]
        >
      );

    const prompt = `
  Generate a markdown-formatted response to the following question: "${question}".

  Consider the provided context:
  **Context:** ${content}

  Also, prioritize and incorporate the user's answer when formulating your response:
  **User's Answer:** ${userAnswer}

  Prioritize the user's answer only if it's correct. If it's incomplete or incorrect, improve or correct it while keeping the response concise and to the point.
  Provide the final answer in markdown format.
  `.trim();

    const system = `
  You are a helpful assistant that provides informative responses in markdown format.
  Use appropriate markdown syntax for headings, lists, code blocks, and emphasis where necessary.
  For code blocks, use short-form lower-case language identifiers (e.g., 'js', 'py', 'ts', 'html', 'css').
  `.trim();

    const { text } = await generateText({
      model: openrouter("arcee-ai/trinity-large-preview:free"),
      prompt,
      system,
    });

    return NextResponse.json({ success: true, data: text }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
