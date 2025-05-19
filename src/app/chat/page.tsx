"use client";

import { useChat } from "ai/react";
import ReactMarkdown from "react-markdown";
import { Send, Loader2 } from "lucide-react";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import clsx from "clsx";
export default function ChatPage() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading
  } = useChat({
    api: "/api/chat",
    streamProtocol: "text"
  });

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
      {/* メッセージ表示エリア */}
      <div className="flex-1 space-y-4 overflow-y-auto rounded-lg p-4 shadow">
        {messages.map(m => (
          <div
            key={m.id}
            className={m.role === "user" ? "text-right" : "text-left"}
          >
            <div className="prose whitespace-pre-wrap">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {m.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {/* 返事待ちインジケータ */}
        {isLoading && (
          <div className="text-left flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>返事を生成中…</span>
          </div>
        )}
      </div>

      {/* 入力フォーム */}
      <form
        onSubmit={handleSubmit}
        className="relative border rounded-xl p-2"
      >
        <Textarea
          className="resize-none border-none p-3 pr-14 shadow "
          value={input}
          onChange={handleInputChange}
          rows={3}
          disabled={isLoading}
          onKeyDown={e => {
            if (
              (e.key === "Enter" && (e.ctrlKey || e.metaKey)) // Ctrl+Enter (Win/Linux), Cmd+Enter (Mac)
            ) {
              e.preventDefault();
              if (input.trim() && !isLoading) {
                handleSubmit(e as any);
              }
            }
          }}
        />
        <Button
          type="submit"
          className="absolute bottom-3 right-3 rounded-xl p-3 text-white shadow disabled:opacity-50"
          disabled={!input.trim() || isLoading}
          aria-label="送信"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
      <div
        className={clsx(
          "flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border p-4 shadow-lg bg-muted/30 backdrop-blur", // base styles
        )}
      >
        <p className="text-sm sm:text-base font-medium leading-relaxed">
          このチャットボットは みなさまのご寄付で運営されています。
        </p>
        <Button asChild size="sm" className="whitespace-nowrap">
          <Link href="https://buy.stripe.com/aFa28r7I68gd28S7wq1oP3z">ご支援はこちら ▶</Link>
        </Button>
      </div>
    </main>
  );
}
