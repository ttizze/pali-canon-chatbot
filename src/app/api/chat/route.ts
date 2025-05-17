import { NextRequest } from "next/server";
import OpenAI from "openai";
const vectorStoreId = process.env.VECTOR_STORE_ID || "";
const openai = new OpenAI();

export async function POST(req: NextRequest) {
  const { messages } = await req.json(); // [{role:"user", content:"…"}]

  const res = await openai.responses.create({
    model: "gpt-4o-mini",
    tools: [{ type: "file_search", vector_store_ids: [vectorStoreId] }],
    include: ["file_search_call.results"],
    input: [
      {
        type: "message",
        role: "system",
        content:
          "あなたはパーリ仏典の専門家。回答は必ず日本語で行い、各引用にスッタ名と段落番号、原文を含めること。"
      },
      ...messages.map((m: any) => ({
        type: "message",
        role: m.role,
        content: m.content
      }))
    ]
  });
  console.log("res:", res);
  const citationBlocks: string[] = [];

  for (const item of res.output ?? []) {
    if (item.type === "file_search_call" && item.results) {
      for (const r of item.results) {
        citationBlocks.push(
          `- **${r.filename ?? r.file_id}**\n  > ${r.text?.trim()}`
        );
      }
    }
  }

  const answer = citationBlocks.length
    ? `${res.output_text.trim()}

---

## 📚 出典

${citationBlocks.join("\n\n")}`
    : res.output_text;
  /* ──────────────────────────────────────── */

  return new Response(answer, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });

}
