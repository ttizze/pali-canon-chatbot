/**
 * Arana Tipiṭaka（Google Sites）から日本語訳を一括取得し
 * corpus/arana/*.txt として保存するスクリプト
 *
 * 実行:  bunx tsx scripts/crawl_arana.ts
 */

import axios from "axios";
import { load } from "cheerio";
import { mkdir, writeFile } from "node:fs/promises";

const ROOT = "https://sites.google.com/view/arana-tipitaka";
const OUT_DIR = "corpus/arana";

async function fetchHtml(url: string) {
  const { data } = await axios.get(url, {
    responseType: "text",
    headers: { "User-Agent": "pali-canon-bot/0.1" }
  });
  return load(data);
}

// ひらがな・カタカナ・漢字・英数のみ残し、他を "_"
function sanitize(name: string) {
  return (
    name
      .normalize("NFKC")                               // 全角英数などを正規化
      .replace(/[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\w]+/gu, "_")
      .replace(/^_+|_+$/g, "")                        // 先頭末尾の "_" を除去
      .replace(/_+/g, "_")                            // 連続 "_" を 1 つに
  );
}

async function main() {
  const $root = await fetchHtml(ROOT);
  const links = new Set<string>();

  $root("a").each((_, el) => {
    const href = $root(el).attr("href");
    if (href?.startsWith("/view/arana-tipitaka/")) {
      links.add("https://sites.google.com" + href);
    }
  });

  await mkdir(OUT_DIR, { recursive: true });
  console.log(`found ${links.size} pages`);

  let done = 0;
  for (const url of links) {
    const $ = await fetchHtml(url);
    const title =
      $("h1, h2").first().text().trim() ||
      url.substring(url.lastIndexOf("/") + 1);

    // Google Sites には <main> が無い場合も多いのでフォールバック
    const paragraphs =
      $("main p").length > 0 ? $("main p") : $("p");

    const body = paragraphs
      .map((_, p) => $(p).text().trim())
      .get()
      .filter(Boolean)
      .join("\n\n");

    // 文字数が極端に少ないページだけスキップ
    if (body.length < 50) continue;

    await writeFile(
      `${OUT_DIR}/${sanitize(title)}.txt`,
      `# ${title}\n\n${body}`
    );

    done++;
    if (done % 20 === 0) console.log(`…${done}/${links.size}`);
    await new Promise(r => setTimeout(r, 500)); // 0.5 秒スロットル
  }

  console.log(`saved ${done} files to ${OUT_DIR}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
