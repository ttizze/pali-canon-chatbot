"use client";

import { useChat } from "ai/react";
import ReactMarkdown from "react-markdown";
import { Send, Loader2 } from "lucide-react";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

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
      <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border p-4 shadow">
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
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          className="flex-1 resize-none rounded-xl border p-3 shadow text-black"
          value={input}
          onChange={handleInputChange}
          rows={3}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="rounded-xl bg-blue-600 p-3 text-white shadow disabled:opacity-50"
          disabled={!input.trim() || isLoading}
          aria-label="送信"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
    </main>
  );
}
