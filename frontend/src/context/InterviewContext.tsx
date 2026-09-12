"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Difficulty, Message, Report } from "@/lib/types";

interface InterviewState {
  topic: string;
  difficulty: Difficulty;
  history: Message[];
  done: boolean;
  report: Report | null;
}

const STORAGE_KEY = "ai-interview-coach-state";

const emptyState: InterviewState = {
  topic: "",
  difficulty: "Easy",
  history: [],
  done: false,
  report: null,
};

interface InterviewContextValue extends InterviewState {
  startNew: (topic: string, difficulty: Difficulty, history: Message[]) => void;
  updateHistory: (history: Message[], done: boolean) => void;
  setReport: (report: Report | null) => void;
  reset: () => void;
}

const InterviewContext = createContext<InterviewContextValue | null>(null);

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InterviewState>(emptyState);
  const [hydrated, setHydrated] = useState(false);

  // Restore state on mount so a page refresh mid-interview doesn't lose progress.
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setState(JSON.parse(raw) as InterviewState);
      } catch {
        // corrupt/old data, ignore and start fresh
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value: InterviewContextValue = {
    ...state,
    startNew: (topic, difficulty, history) => setState({ topic, difficulty, history, done: false, report: null }),
    updateHistory: (history, done) => setState((s) => ({ ...s, history, done })),
    setReport: (report) => setState((s) => ({ ...s, report })),
    reset: () => {
      sessionStorage.removeItem(STORAGE_KEY);
      setState(emptyState);
    },
  };

  return <InterviewContext.Provider value={value}>{children}</InterviewContext.Provider>;
}

export function useInterview() {
  const ctx = useContext(InterviewContext);
  if (!ctx) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }
  return ctx;
}
