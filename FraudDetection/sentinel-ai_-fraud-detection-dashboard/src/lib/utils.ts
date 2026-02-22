import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Transaction {
  id: string;
  timestamp: string;
  amount: number;
  merchant: string;
  category: string;
  location: string;
  risk_score: number;
  is_fraud: number;
  features: number[];
}

export interface Stats {
  total: number;
  fraud: number;
  accuracy: number;
  precision: number;
  recall: number;
}
