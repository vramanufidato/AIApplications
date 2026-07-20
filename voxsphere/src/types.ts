export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "VERIFIED_CREATOR" | "NGO_PARTNER";
  createdAt: string;
}

export interface AudioPod {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  category: "MENTAL_HEALTH" | "CAREER" | "CLIMATE" | "LEGAL_RIGHTS" | "INTERGENERATIONAL_WISDOM";
  transcript: string;
  partnerLink?: string;
  userId: string;
  user: User;
  createdAt: string;
  moderationStatus: "PENDING" | "APPROVED" | "FLAGGED";
  moderationReason?: string;
  replies: VoiceReply[];
}

export interface VoiceReply {
  id: string;
  audioUrl: string;
  duration: number;
  transcript: string;
  userId: string;
  user: User;
  podId: string;
  createdAt: string;
  moderationStatus: "PENDING" | "APPROVED" | "FLAGGED";
  moderationReason?: string;
}

export interface AuditLog {
  timestamp: string;
  podTitle?: string;
  transcript: string;
  type: "UPLOAD" | "REPLY";
  status: "APPROVED" | "FLAGGED";
  rulesChecked: string[];
  geminiAnalysis?: {
    approved?: boolean;
    reason?: string;
    categoryMatch?: string;
    safetyScore?: number;
    note?: string;
  };
}
