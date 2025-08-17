export interface DateFormat {
  name: string;
  value: string;
}

export interface TimezoneInfo {
  name: string;
  code: string;
  time: string;
}

export interface DiffLine {
  type: "add" | "remove" | "normal";
  content: string;
  highlightedContent?: string;
  lineNumber?: number;
}

export interface RegexMatch {
  match: string;
  index: number;
  groups?: string[];
}

export interface JWTPayload {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isValid: boolean;
  error?: string;
}

export interface CertificateInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  algorithm: string;
  fingerprint: string;
  isValid: boolean;
  error?: string;
}

export type SortOrder = "asc" | "desc";
export type SortType = "alphabetical" | "numerical" | "length";

export interface LapTime {
  id: number;
  time: number;
  lapTime: number;
}

export interface WorldClockCity {
  name: string;
  timezone: string;
  country: string;
}

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  bytes: number;
}

export interface CompoundInterestResult {
  finalAmount: number;
  totalInterest: number;
  totalContributions: number;
  milestones: Array<{
    month: number;
    balance: number;
    multiple: number;
  }>;
  monthlyBreakdown: Array<{
    month: number;
    principal: number;
    interest: number;
    balance: number;
    contribution: number;
  }>;
}

export interface DebtPaymentResult {
  totalInterest: number;
  totalPayments: number;
  payoffTime: number;
  monthlyBreakdown: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}
