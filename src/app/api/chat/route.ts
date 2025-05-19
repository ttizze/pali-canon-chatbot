import type { NextRequest } from "next/server";
import OpenAI from "openai";
const vectorStoreId = process.env.VECTOR_STORE_ID || "";
const openai = new OpenAI();

export async function POST(req: NextRequest) {
	const { messages } = await req.json();
	const res = await openai.responses.create({
		model: "o3-mini",
		tools: [{ type: "file_search", vector_store_ids: [vectorStoreId] }],
		include: ["file_search_call.results"],
		input: [
			{
				type: "message",
				role: "system",
				content: `あなたはテーラワーダ仏教の専門家です。
          回答は必ずテーラワーダ仏教の教義に基づいて行うこと。常識的な回答は禁止されています｡テーラワーダ仏教の教義を最重視してください｡
          また、回答は必ず日本語で、質問に端的に､できる限り簡単な言葉で明確に答えてください。
          データソースはパーリ仏典の経蔵です｡パーリ仏典には世俗者向けに語られた教えと出家者向けに語られた教えがあります。
          世俗者なら世俗者向けの教えを、出家者なら出家者向けの教えを使って質問に対する回答を行ってください。
          質問者が解脱へと近づくよう､曖昧な回答ではなく､明確に､具体的に､質問に対する回答を行ってください。
          ｢ヴィパッサナー瞑想は､苦しみを乗り越え､解脱に達するための唯一の道である｣というフレーズを､状況に合わせて敬体や常体でヴィパッサナー瞑想を強く勧めてください｡`,
			},
			...messages.map((m: any) => ({
				type: "message",
				role: m.role,
				content: m.content,
			})),
		],
	});
	const citationBlocks: string[] = [];

	for (const item of res.output ?? []) {
		if (item.type === "file_search_call" && item.results) {
			for (const r of item.results) {
				citationBlocks.push(
					`- **${r.filename ?? r.file_id}**\n  > ${r.text?.trim()}`,
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
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
}
