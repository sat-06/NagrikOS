// Domain types shared across the NagrikOS frontend.
// These are designed so the demo service layer can be replaced with real
// backend calls without touching UI components.

export type Language = "en" | "hi" | "mr";

export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CitizenProfile {
  userId: string;
  fullName: string;
  preferredLanguage: Language;
  state?: string;
  district?: string;
  age?: number;
  occupation?: string;
  incomeBand?: "below_1L" | "1L_3L" | "3L_6L" | "6L_12L" | "above_12L";
  isStudent?: boolean;
  isFarmer?: boolean;
  completeness: number; // 0-100
}

export type ServiceCategory =
  | "healthcare" | "education" | "employment" | "agriculture"
  | "housing" | "senior_citizen" | "women_child" | "business"
  | "welfare" | "identity" | "utility" | "roads";

export interface ServiceScheme {
  id: string;
  name: string;
  category: ServiceCategory;
  shortDescription: string;
  simplifiedDescription: string;
  targetGroups: string[];
  benefits: string[];
  requiredDocuments: string[];
  applicationSteps: string[];
  stateApplicability: string[]; // "ALL" or state names
  sourceName: string;
  sourceUrl: string;
  lastReviewed: string;
  isPrototype?: boolean;
}

export interface RecommendationExplanation {
  matched: string[];
  uncertain: string[];
  missing: string[];
  possibleMismatch: string[];
}

export interface Recommendation {
  id: string;
  service: ServiceScheme;
  matchScore: number; // 0-100
  reason: string;
  explanation: RecommendationExplanation;
}

export interface ChatMessageAction { title: string; description: string; }
export interface ChatSource { title: string; url: string; }

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  // Assistant-rich sections
  understoodSituation?: {
    primaryNeed?: string;
    personContext?: string;
    known: Record<string, string>;
    missing: string[];
    categories: string[];
  };
  suggestedActions?: ChatMessageAction[];
  relatedServices?: ServiceScheme[];
  sources?: ChatSource[];
  uncertainty?: string;
  disclaimer?: string;
  status?: "sending" | "streaming" | "complete" | "error";
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface LifeSituationAnalysis {
  primaryNeed: string;
  personContext?: string;
  known: Record<string, string>;
  missing: string[];
  categories: string[];
}

export type MissionStatus = "active" | "completed" | "archived";
export type MissionStepStatus = "pending" | "in_progress" | "complete";
export type MissionStepActionType = "document" | "form" | "visit" | "confirm" | "review";

export interface MissionStep {
  id: string;
  order: number;
  title: string;
  explanation: string;
  status: MissionStepStatus;
  actionType: MissionStepActionType;
  relatedDocument?: string;
}

export interface CivicMission {
  id: string;
  title: string;
  purpose: string;
  category: ServiceCategory;
  status: MissionStatus;
  relatedServiceId?: string;
  nextBestAction: string;
  steps: MissionStep[];
  createdAt: string;
}

export type DocStatus = "available" | "missing" | "uncertain" | "expiring";

export interface UserDocument {
  id: string;
  name: string;
  type: string;
  status: DocStatus;
  note?: string;
  uploadedAt?: string;
}

export interface DocumentReadiness {
  contextTitle: string;
  contextType: "service" | "mission";
  readinessPercent: number;
  available: UserDocument[];
  missing: UserDocument[];
  uncertain: UserDocument[];
  nextActions: string[];
}

export type ComplaintStatus =
  | "reported" | "ai_classified" | "routed" | "acknowledged"
  | "in_progress" | "citizen_verification" | "resolved";

export interface ComplaintTimelineEvent {
  id: string;
  stage: ComplaintStatus;
  title: string;
  timestamp: string;
  note?: string;
  evidenceLabel?: string;
}

export interface ComplaintAnalysis {
  category: string;
  severity: "low" | "medium" | "high";
  department: string;
  draft: string;
  confidence: number;
  uncertainty?: string;
}

export interface DuplicateIssue {
  id: string;
  summary: string;
  category: string;
  distanceKm: number;
  status: ComplaintStatus;
  similarity: number;
  supporterCount: number;
}

export interface ResolutionVerification {
  citizenVerified: "pending" | "yes" | "no";
  authorityStatus: ComplaintStatus;
  note?: string;
}

export interface Complaint {
  id: string;
  summary: string;
  description: string;
  category: string;
  severity: "low" | "medium" | "high";
  department: string;
  location: { label: string; lat?: number; lng?: number };
  status: ComplaintStatus;
  supporterCount: number;
  createdAt: string;
  timeline: ComplaintTimelineEvent[];
  verification: ResolutionVerification;
  imageUrl?: string;
}
