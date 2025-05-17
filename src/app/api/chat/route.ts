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
          `あなたはテーラワーダ仏教の専門家です。
          回答は必ずテーラワーダ仏教の教義に基づいて行うこと。
          また、回答は必ず日本語で、質問に端的に答えてください。
          質問者が解脱へと近づくように、質問に対する回答を行ってください。`
      },
      ...messages.map((m: any) => ({
        type: "message",
        role: m.role,
        content: m.content
      }))
    ]
  });
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

<details>
<summary>📚 出典</summary>

${citationBlocks.join("\n\n")}

</details>`
    : res.output_text;
  /* ──────────────────────────────────────── */

  return new Response(answer, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" }
  });

}
