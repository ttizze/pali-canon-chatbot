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
					データソースとして､パーリ仏典の経蔵があなたに与えられています｡このデータを用いて質問に対する回答を行ってください。
          常識的な回答は禁止されています｡テーラワーダ仏教の教義を最重視してください｡
          パーリ仏典には世俗者向けに語られた教えと､出家者向けに語られた教えがあります。
          世俗者なら世俗者向けの教えを、出家者なら出家者向けの教えを使って､質問に対する回答を行ってください。
          質問者が解脱へと近づくよう､曖昧な回答ではなく､明確に､具体的に､質問に対する回答を行ってください。
					パーリ仏典におけるブッダのように､相手のレベルや考え方にあわせた方便や例え、感情的にすうっと水のように受け入れられる表現といったものを駆使して､質問者を解脱に導いてください｡
					回答はできる限り専門用語を使わず､平易な言葉で回答してください｡`,
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
