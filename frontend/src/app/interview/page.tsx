"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { submitAnswer } from "@/lib/api";
import { useInterview } from "@/context/InterviewContext";

export default function InterviewPage() {
  const router = useRouter();
  const { topic, difficulty, history, done, updateHistory } = useInterview();

  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const redirectedRef = useRef(false);

  // No active interview in context (e.g. direct nav or a hard refresh before hydration) — go back to start.
  useEffect(() => {
    if (!topic && history.length === 0) {
      router.replace("/");
    }
  }, [topic, history, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history, sending]);

  useEffect(() => {
    if (done && !redirectedRef.current) {
      redirectedRef.current = true;
      router.push("/report");
    }
  }, [done, router]);

  async function sendAnswer() {
    const trimmed = answer.trim();
    if (!trimmed || sending || done) return;

    setSending(true);
    setError(null);
    const optimisticHistory = [...history, { role: "candidate" as const, content: trimmed }];
    updateHistory(optimisticHistory, false);
    setAnswer("");

    try {
      const result = await submitAnswer(topic, difficulty, history, trimmed);
      updateHistory(result.history, result.done);
    } catch (err) {
      // Roll back the optimistic candidate message so the user can retry.
      updateHistory(history, false);
      setAnswer(trimmed);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAnswer();
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-red-950 bg-black/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-red-50 sm:text-base">{topic}</p>
            <p className="text-xs text-red-300/40">Live interview</p>
          </div>
          <span className="shrink-0 rounded-full border border-red-800 bg-red-900/20 px-3 py-1 text-xs font-medium text-red-300">
            {difficulty}
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
        {history.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === "candidate" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[75%] ${
                message.role === "candidate"
                  ? "rounded-br-sm bg-red-800 text-red-50 shadow-red-950/50"
                  : "rounded-bl-sm border border-red-950 bg-neutral-950 text-red-100"
              }`}
            >
              {message.role === "interviewer" && (
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-500">
                  Interviewer
                </p>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-red-950 bg-neutral-950 px-4 py-3 text-sm text-red-300/70">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-red-700 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-red-700 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-red-700" />
              </span>
              Interviewer is thinking…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      <footer className="sticky bottom-0 border-t border-red-950 bg-black/90 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          {error && (
            <div role="alert" className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
          <div className="flex items-end gap-3">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending || done}
              placeholder="Type your answer… (Enter to send, Shift+Enter for a new line)"
              rows={2}
              className="flex-1 resize-none rounded-lg border border-red-900/60 bg-black px-4 py-2.5 text-sm text-red-50 placeholder:text-red-900 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={sendAnswer}
              disabled={sending || done || !answer.trim()}
              className="shrink-0 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-red-50 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
