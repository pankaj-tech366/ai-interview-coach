"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { startInterview } from "@/lib/api";
import { useInterview } from "@/context/InterviewContext";
import type { Difficulty } from "@/lib/types";
import { DIFFICULTIES } from "@/lib/types";
import FallingLeaves from "@/components/FallingLeaves";
import SpookyTreeline from "@/components/SpookyTreeline";
import LightningFlash from "@/components/LightningFlash";
import EvilEyes from "@/components/EvilEyes";

export default function HomePage() {
  const router = useRouter();
  const { startNew } = useInterview();

  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedTopic = topic.trim();

    if (!trimmedTopic) {
      setError("Please enter a technical topic to be interviewed on.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { history } = await startInterview(trimmedTopic, difficulty);
      startNew(trimmedTopic, difficulty, history);
      router.push("/interview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="thunder-shake relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      <FallingLeaves />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0">
        <SpookyTreeline />
      </div>
      <EvilEyes />
      <LightningFlash />

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-red-50 [text-shadow:0_0_25px_rgba(220,38,38,0.45)] sm:text-4xl">
            AI Interview Coach
          </h1>
          <p className="mt-3 text-sm text-red-200/50 sm:text-base">
            Pick a technical topic and difficulty, and get interviewed one question at a time by
            an AI interviewer that adapts to your answers.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-red-950 bg-black/60 p-6 shadow-2xl shadow-red-950/40 sm:p-8"
        >
          <div className="mb-6">
            <label htmlFor="topic" className="mb-2 block text-sm font-medium text-red-200/80">
              Technical topic
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Binary Trees"
              disabled={loading}
              className="w-full rounded-lg border border-red-900/60 bg-black px-4 py-2.5 text-red-50 placeholder:text-red-900 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 disabled:opacity-60"
            />
          </div>

          <div className="mb-6">
            <span className="mb-2 block text-sm font-medium text-red-200/80">Difficulty</span>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((level) => (
                <button
                  key={level}
                  type="button"
                  disabled={loading}
                  onClick={() => setDifficulty(level)}
                  aria-pressed={difficulty === level}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition disabled:opacity-60 ${
                    difficulty === level
                      ? "border-red-600 bg-red-900/30 text-red-300 shadow-[0_0_12px_-2px_rgba(220,38,38,0.6)]"
                      : "border-red-950 bg-black text-red-200/60 hover:border-red-800"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-red-50 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
            )}
            {loading ? "Starting interview…" : "Start Interview"}
          </button>
        </form>
      </div>
    </main>
  );
}
