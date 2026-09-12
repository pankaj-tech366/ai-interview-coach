"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getReport } from "@/lib/api";
import { useInterview } from "@/context/InterviewContext";

function scoreColor(score: number) {
  if (score >= 70) return "text-emerald-400";
  if (score >= 55) return "text-amber-400";
  return "text-red-400";
}

function scoreRingColor(score: number) {
  if (score >= 70) return "border-emerald-500/40 bg-emerald-500/10";
  if (score >= 55) return "border-amber-500/40 bg-amber-500/10";
  return "border-red-500/40 bg-red-500/10";
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="rounded-xl border border-red-950 bg-neutral-950/60 p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-400/70">{title}</h2>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-2 text-sm leading-relaxed text-red-50">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-700" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ReportPage() {
  const router = useRouter();
  const { topic, difficulty, history, report, setReport, reset } = useInterview();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getReport(topic, difficulty, history);
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, difficulty, history]);

  useEffect(() => {
    if (!topic && history.length === 0) {
      router.replace("/");
      return;
    }
    if (!report && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchReport();
    }
  }, [topic, history, report, router, fetchReport]);

  function handleRetry() {
    fetchedRef.current = true;
    fetchReport();
  }

  function handleStartNew() {
    reset();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-red-950 border-t-red-600"
          aria-hidden="true"
        />
        <p className="text-sm text-red-200/50">Generating your report…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <div className="max-w-md rounded-xl border border-red-800 bg-red-950/50 px-6 py-5 text-sm text-red-300">
          {error}
        </div>
        <button
          type="button"
          onClick={handleRetry}
          className="rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-red-50 transition hover:bg-red-600"
        >
          Retry
        </button>
      </main>
    );
  }

  if (!report) return null;

  const isPass = report.result === "Pass";

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-red-50 [text-shadow:0_0_25px_rgba(220,38,38,0.4)]">Interview Complete</h1>
        <p className="mt-2 text-sm text-red-200/50">
          {topic} <span className="text-red-900">•</span> {difficulty}
        </p>
      </div>

      <div className="mb-8 flex flex-col items-center gap-4 rounded-2xl border border-red-950 bg-black/60 p-8 shadow-2xl shadow-red-950/40 sm:flex-row sm:justify-around">
        <div className="flex flex-col items-center">
          <div
            className={`flex h-28 w-28 items-center justify-center rounded-full border-4 ${scoreRingColor(report.score)}`}
          >
            <span className={`text-4xl font-bold ${scoreColor(report.score)}`}>{report.score}</span>
          </div>
          <p className="mt-2 text-xs uppercase tracking-wide text-red-300/50">Score / 100</p>
        </div>

        <div className="flex flex-col items-center">
          <span
            className={`rounded-full px-6 py-2 text-xl font-bold tracking-wide ${
              isPass ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
            }`}
          >
            {isPass ? "PASS" : "FAIL"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <Section title="Strengths" items={report.strengths} />
        <Section title="Areas for Improvement" items={report.weaknesses} />
        <Section title="Topics to Revise" items={report.topics_to_revise} />

        <div className="rounded-xl border border-red-950 bg-neutral-950/60 p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-400/70">
            Interviewer&apos;s Verdict
          </h2>
          <p className="text-sm leading-relaxed text-red-50">{report.verdict}</p>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={handleStartNew}
          className="rounded-lg bg-red-700 px-6 py-2.5 text-sm font-semibold text-red-50 transition hover:bg-red-600"
        >
          Start New Interview
        </button>
      </div>
    </main>
  );
}
