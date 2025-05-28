"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "ai/react";
import { Loader2, Send } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HeartHandshake, MessageCircle } from "lucide-react";

export default function ChatPage() {
	const { messages, input, handleInputChange, handleSubmit, isLoading } =
		useChat({
			api: "/api/chat",
			streamProtocol: "text",
		});

	return (
		<main className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
			<h1 className="text-2xl font-bold">仏教AI</h1>
			{/* メッセージ表示エリア */}
			<div className="flex-1 space-y-4 overflow-y-auto rounded-lg p-4 shadow">
				{messages.map((m) => (
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
			<form onSubmit={handleSubmit} className="relative border rounded-xl p-2">
				<Textarea
					className="resize-none border-none p-3 pr-14 shadow "
					value={input}
					onChange={handleInputChange}
					rows={3}
					disabled={isLoading}
					onKeyDown={(e) => {
						if (
							e.key === "Enter" &&
							(e.ctrlKey || e.metaKey) // Ctrl+Enter (Win/Linux), Cmd+Enter (Mac)
						) {
							e.preventDefault();
							if (input.trim() && !isLoading) {
								handleSubmit(e);
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
			{/* --- 💖 Support Callout ここから --- */}
			<Alert
				variant="default"
				className="
					group relative flex flex-col gap-4
					rounded-xl border border-rose-500/40
					bg-rose-400/5 dark:bg-rose-500/15
					backdrop-blur-md shadow-lg
					ring-1 ring-inset ring-rose-500/20
					transition-colors
				"
			>
				{/* グロー用レイヤー */}
				<span
					className="
						pointer-events-none absolute inset-0 -z-10 rounded-[inherit]
						opacity-0 group-hover:opacity-100
						bg-rose-500/20 blur-lg transition-opacity duration-500
					"
				/>

				{/* アイコン＋テキスト */}
				<div className="flex items-start gap-4">
					<HeartHandshake className="h-6 w-6 shrink-0 text-rose-400" />
					<div className="flex-1 space-y-1">
						<AlertTitle className="text-base font-semibold text-rose-50">
							ご支援のお願い
						</AlertTitle>
						<AlertDescription className="text-sm leading-6">
							この仏教AIはみなさまのご寄付で運営されています。<br />
							現在のご支援額総額は
							<span className="mx-1 font-bold text-rose-400">¥2230</span>
							です。
						</AlertDescription>
					</div>
				</div>

				{/* CTA ボタン – テキストの下＆幅いっぱい */}
				<Button
					asChild
					size="sm"
					className="
						w-full
						bg-rose-600 hover:bg-rose-700 text-white
					"
				>
					<Link
						href="https://buy.stripe.com/aFa28r7I68gd28S7wq1oP3z"
						target="_blank"
						rel="noopener noreferrer"
					>
						ご支援はこちら&nbsp;▶
					</Link>
				</Button>
			</Alert>
			{/* --- 💖 Support Callout ここまで --- */}
			{/* --- 📝 Feedback Callout ここから --- */}
			<Alert
				variant="default"
				className="
					group relative flex flex-col gap-4
					rounded-xl border border-blue-500/40
					bg-blue-400/5 dark:bg-blue-500/15
					backdrop-blur-md shadow-lg
					ring-1 ring-inset ring-blue-500/20
					transition-colors
				"
			>
				{/* グロー用レイヤー */}
				<span
					className="
						pointer-events-none absolute inset-0 -z-10 rounded-[inherit]
						opacity-0 group-hover:opacity-100
						bg-blue-500/20 blur-lg transition-opacity duration-500
					"
				/>

				{/* アイコン + テキストを 1 行に */}
				<div className="flex items-start gap-4">
					<MessageCircle className="h-6 w-6 shrink-0 text-blue-400" />
					<div className="flex-1 space-y-1">
						<AlertTitle className="text-base font-semibold text-blue-50">
							ご意見をお聞かせください
						</AlertTitle>
						<AlertDescription className="text-sm leading-6">
							AI の回答精度向上のため、30&nbsp;秒のアンケートにご協力ください。
						</AlertDescription>
					</div>
				</div>

				{/* CTA ボタン – 文言の下＆幅いっぱい */}
				<Button
					asChild
					size="sm"
					className="
						w-full
						bg-blue-600 hover:bg-blue-700 text-white
					"
				>
					<Link
						href="https://forms.gle/L5YajsYhQBEMkN1e8"
						target="_blank"
						rel="noopener noreferrer"
					>
						アンケートに回答&nbsp;▶
					</Link>
				</Button>
			</Alert>
			{/* --- 📝 Feedback Callout ここまで --- */}
		</main>
	);
}
