export type Difficulty = "Easy" | "Medium" | "Hard";

export type Speaker = "interviewer" | "candidate";

export interface Message {
  role: Speaker;
  content: string;
}

export interface Report {
  score: number;
  strengths: string[];
  weaknesses: string[];
  topics_to_revise: string[];
  verdict: string;
  result: "Pass" | "Fail";
}

export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
