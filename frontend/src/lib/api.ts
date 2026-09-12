import type { Difficulty, Message, Report } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the server. Please check your connection and try again.");
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // response had no JSON body; handled by the !res.ok check below
  }

  if (!res.ok) {
    const detail = (data as { detail?: string } | null)?.detail;
    throw new Error(detail || "Something went wrong. Please try again.");
  }

  return data as T;
}

export interface InterviewTurn {
  history: Message[];
  done: boolean;
}

export function startInterview(topic: string, difficulty: Difficulty): Promise<InterviewTurn> {
  return post<InterviewTurn>("/api/interview/start", { topic, difficulty });
}

export function submitAnswer(
  topic: string,
  difficulty: Difficulty,
  history: Message[],
  answer: string
): Promise<InterviewTurn> {
  return post<InterviewTurn>("/api/interview/answer", { topic, difficulty, history, answer });
}

export function getReport(topic: string, difficulty: Difficulty, history: Message[]): Promise<Report> {
  return post<Report>("/api/interview/report", { topic, difficulty, history });
}
