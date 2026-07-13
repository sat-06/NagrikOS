import { api } from "./client";
import type {
  ChatMessage,
  ChatMessageAction,
  ChatSession,
  ChatSource,
  CitizenProfile,
  CivicMission,
  Complaint,
  ComplaintAnalysis,
  ComplaintStatus,
  ComplaintTimelineEvent,
  DocStatus,
  DocumentReadiness,
  DuplicateIssue,
  Language,
  MissionStep,
  MissionStepActionType,
  MissionStepStatus,
  MissionStatus,
  Recommendation,
  ResolutionVerification,
  ServiceCategory,
  ServiceScheme,
  UserDocument,
} from "@/types";

// ---------------------------------------------------------------------------
// Backend response shapes (mirrors of the FastAPI Pydantic schemas)
// ---------------------------------------------------------------------------

interface ServiceSchemeOut {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  simplified_description: string;
  category: string;
  target_groups: string[];
  state_applicability: string[];
  required_documents: string[];
  benefits: string[];
  application_steps: string[];
  official_source_url?: string | null;
  source_title?: string | null;
  last_reviewed_at?: string | null;
  is_demo_data: boolean;
}

interface RecommendationItemOut {
  service: ServiceSchemeOut;
  match_score: number;
  matched_criteria: string[];
  uncertain_criteria: string[];
  missing_information: string[];
  possible_mismatches: string[];
  explanation: string;
  disclaimer: string;
}

interface RecommendationResponseOut {
  recommendations: RecommendationItemOut[];
  profile_completeness: number;
  disclaimer: string;
}

interface ProfileOut {
  id: number;
  user_id: number;
  full_name?: string | null;
  preferred_language: string;
  state?: string | null;
  district?: string | null;
  date_of_birth?: string | null;
  occupation?: string | null;
  income_band?: string | null;
  gender?: string | null;
  is_student: boolean;
  is_farmer: boolean;
  is_senior_citizen: boolean;
  is_woman: boolean;
  created_at: string;
  updated_at: string;
}

interface ChatSessionOut {
  id: number;
  title?: string | null;
  created_at: string;
  updated_at: string;
}

interface ChatMessageOut {
  id: number;
  role: string;
  content: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

interface MissionStepOut {
  id: number;
  order: number;
  title: string;
  description?: string | null;
  status: string;
  action_type?: string | null;
  related_document?: string | null;
}

interface MissionOut {
  id: number;
  title: string;
  description?: string | null;
  category?: string | null;
  status: string;
  progress_percentage: number;
  source_type: string;
  related_service_ids: number[];
  steps: MissionStepOut[];
  created_at: string;
  updated_at: string;
}

interface ReadinessItemOut {
  document_type: string;
  status: string;
  notes?: string | null;
}

interface ReadinessResponseOut {
  service_id: number;
  service_name: string;
  available_documents: ReadinessItemOut[];
  missing_documents: string[];
  uncertain_documents: string[];
  readiness_percentage: number;
  next_actions: string[];
}

interface TimelineEventOut {
  id: number;
  event_type: string;
  status?: string | null;
  note?: string | null;
  created_at: string;
}

interface ComplaintOut {
  id: number;
  title: string;
  description: string;
  category: string;
  severity: string;
  suggested_department?: string | null;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  supporter_count: number;
  created_at: string;
  updated_at: string;
  timeline: TimelineEventOut[];
}

interface ComplaintAnalysisOut {
  predicted_category: string;
  severity_suggestion: string;
  suggested_department: string;
  generated_draft: string;
  confidence: number;
  uncertainty_notes: string[];
}

interface DuplicateCandidateOut {
  complaint_id: number;
  title: string;
  description: string;
  category: string;
  similarity_score: number;
  distance_km?: number | null;
  supporter_count: number;
  created_at: string;
  explanation: string;
}

// ---------------------------------------------------------------------------
// Service catalog cache (maps between the frontend slug-based ids and the
// backend numeric ids used by mission / readiness endpoints)
// ---------------------------------------------------------------------------

const slugToId = new Map<string, number>();
const idToSlug = new Map<number, string>();
const nameToId = new Map<string, number>();
const idToCategory = new Map<number, string>();
let serviceCachePromise: Promise<void> | null = null;

function humanize(value: string): string {
  return value
    .replace(/[_/]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function ymd(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function calcAge(dob?: string | null): number | undefined {
  if (!dob) return undefined;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? age : undefined;
}

function mapService(s: ServiceSchemeOut): ServiceScheme {
  slugToId.set(s.slug, s.id);
  idToSlug.set(s.id, s.slug);
  nameToId.set(s.name, s.id);
  idToCategory.set(s.id, s.category);
  return {
    id: s.slug,
    name: s.name,
    category: s.category as ServiceCategory,
    shortDescription: s.short_description,
    simplifiedDescription: s.simplified_description,
    targetGroups: s.target_groups ?? [],
    benefits: s.benefits ?? [],
    requiredDocuments: s.required_documents ?? [],
    applicationSteps: s.application_steps ?? [],
    stateApplicability: (s.state_applicability ?? []).map((st) => (/^all/i.test(st) ? "ALL" : st)),
    sourceName: s.source_title ?? "Official source",
    sourceUrl: s.official_source_url ?? "#",
    lastReviewed: ymd(s.last_reviewed_at) || "—",
    isPrototype: s.is_demo_data,
  };
}

async function ensureServiceCache(): Promise<void> {
  if (slugToId.size > 0) return;
  if (!serviceCachePromise) {
    serviceCachePromise = api
      .get<{ items: ServiceSchemeOut[] }>("/services", { params: { limit: 100 } })
      .then(({ data }) => {
        data.items.forEach(mapService);
      })
      .catch(() => {
        serviceCachePromise = null;
      });
  }
  await serviceCachePromise;
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

const COMPLETENESS_FIELDS: (keyof CitizenProfile)[] = [
  "fullName",
  "state",
  "district",
  "age",
  "occupation",
  "incomeBand",
];

function computeCompleteness(p: CitizenProfile): number {
  const filled = COMPLETENESS_FIELDS.filter((f) => {
    const v = p[f];
    return v !== undefined && v !== null && String(v).trim() !== "";
  }).length;
  return Math.round((filled / COMPLETENESS_FIELDS.length) * 100);
}

function mapProfile(p: ProfileOut): CitizenProfile {
  const profile: CitizenProfile = {
    id: p.id,
    userId: String(p.user_id),
    fullName: p.full_name ?? "",
    preferredLanguage: (p.preferred_language as Language) ?? "en",
    state: p.state ?? undefined,
    district: p.district ?? undefined,
    dateOfBirth: p.date_of_birth ?? undefined,
    age: calcAge(p.date_of_birth),
    occupation: p.occupation ?? undefined,
    incomeBand: p.income_band ?? undefined,
    gender: p.gender ?? undefined,
    isStudent: p.is_student,
    isFarmer: p.is_farmer,
    isSeniorCitizen: p.is_senior_citizen,
    isWoman: p.is_woman,
    completeness: 0,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
  profile.completeness = computeCompleteness(profile);
  return profile;
}

function ageToDob(age?: number): string | undefined {
  if (!age || age <= 0) return undefined;
  const year = new Date().getFullYear() - age;
  return `${year}-01-01`;
}

export const profileService = {
  async getProfile(): Promise<CitizenProfile> {
    const { data } = await api.get<ProfileOut>("/profile");
    return mapProfile(data);
  },
  async saveProfile(p: Partial<CitizenProfile>): Promise<CitizenProfile> {
    const body: Record<string, unknown> = {
      full_name: p.fullName,
      preferred_language: p.preferredLanguage,
      state: p.state,
      district: p.district,
      occupation: p.occupation,
      income_band: p.incomeBand,
      gender: p.gender,
      is_student: p.isStudent,
      is_farmer: p.isFarmer,
      is_senior_citizen: p.isSeniorCitizen,
      is_woman: p.isWoman,
    };
    const dob = p.dateOfBirth ?? ageToDob(p.age);
    if (dob) body.date_of_birth = dob;
    Object.keys(body).forEach((k) => {
      if (body[k] === undefined) delete body[k];
    });
    const { data } = await api.put<ProfileOut>("/profile", body);
    return mapProfile(data);
  },
};

// ---------------------------------------------------------------------------
// Services / schemes
// ---------------------------------------------------------------------------

export const servicesService = {
  async list(): Promise<ServiceScheme[]> {
    const { data } = await api.get<{ items: ServiceSchemeOut[] }>("/services", {
      params: { limit: 100 },
    });
    return data.items.map(mapService);
  },
  async byId(slug: string): Promise<ServiceScheme | null> {
    try {
      const { data } = await api.get<ServiceSchemeOut>(`/services/${slug}`);
      return mapService(data);
    } catch {
      return null;
    }
  },
};

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

function mapRecommendation(r: RecommendationItemOut): Recommendation {
  return {
    id: r.service.slug,
    service: mapService(r.service),
    matchScore: Math.round(r.match_score),
    reason: r.explanation,
    explanation: {
      matched: r.matched_criteria ?? [],
      uncertain: r.uncertain_criteria ?? [],
      missing: r.missing_information ?? [],
      possibleMismatch: r.possible_mismatches ?? [],
    },
  };
}

export const recommendationService = {
  async getRecommendations(): Promise<Recommendation[]> {
    const { data } = await api.get<RecommendationResponseOut>("/recommendations");
    return data.recommendations.map(mapRecommendation);
  },
};

// ---------------------------------------------------------------------------
// AI Saathi chat
// ---------------------------------------------------------------------------

function mapAssistantMetadata(msg: ChatMessage, metadata: Record<string, unknown>): void {
  const life = metadata.life_situation as
    { person_context?: string; missing_information?: string[] } | undefined;
  const intent = (metadata.intent as string | undefined) ?? undefined;

  if (life || intent) {
    msg.understoodSituation = {
      primaryNeed: intent ? humanize(intent) : undefined,
      personContext: life?.person_context ?? undefined,
      known: {},
      missing: (life?.missing_information ?? []).map(humanize),
      categories: intent ? [humanize(intent)] : [],
    };
  }

  const actions = metadata.suggested_actions as string[] | undefined;
  if (actions && actions.length) {
    msg.suggestedActions = actions.map<ChatMessageAction>((a) => ({
      title: a,
      description: "",
    }));
  }

  const related = metadata.related_services as { id?: number; name?: string }[] | undefined;
  if (related && related.length) {
    msg.relatedServices = related.map((s) => ({
      id: s.id != null ? (idToSlug.get(s.id) ?? String(s.id)) : (s.name ?? "service"),
      name: s.name ?? "Related service",
      category: "welfare" as ServiceCategory,
      shortDescription: "",
      simplifiedDescription: "",
      targetGroups: [],
      benefits: [],
      requiredDocuments: [],
      applicationSteps: [],
      stateApplicability: [],
      sourceName: "",
      sourceUrl: "#",
      lastReviewed: "—",
    }));
  }

  const sources = metadata.sources as { type?: string; title?: string; url?: string }[] | undefined;
  if (sources && sources.length) {
    msg.sources = sources.map<ChatSource>((s) => ({
      title: s.title ?? (s.type ? humanize(s.type) : "Source"),
      url: s.url ?? "#",
    }));
  }

  const uncertainty = metadata.uncertainty_notes as string[] | undefined;
  if (uncertainty && uncertainty.length) msg.uncertainty = uncertainty.join(" ");

  const disclaimer = metadata.disclaimer as string | undefined;
  if (disclaimer) msg.disclaimer = disclaimer;
}

function mapMessage(m: ChatMessageOut): ChatMessage {
  const msg: ChatMessage = {
    id: String(m.id),
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
    createdAt: m.created_at,
    status: "complete",
  };
  if (msg.role === "assistant" && m.metadata) {
    mapAssistantMetadata(msg, m.metadata);
  }
  return msg;
}

async function fetchSession(s: ChatSessionOut): Promise<ChatSession> {
  let messages: ChatMessage[] = [];
  try {
    const { data } = await api.get<ChatMessageOut[]>(`/saathi/sessions/${s.id}/messages`);
    messages = data.map(mapMessage);
  } catch {
    messages = [];
  }
  return {
    id: String(s.id),
    title: s.title ?? "New conversation",
    updatedAt: s.updated_at,
    messages,
  };
}

export const chatService = {
  async listSessions(): Promise<ChatSession[]> {
    const { data } = await api.get<ChatSessionOut[]>("/saathi/sessions");
    return Promise.all(data.map(fetchSession));
  },
  async createSession(title: string): Promise<ChatSession> {
    const { data } = await api.post<ChatSessionOut>("/saathi/sessions", { title });
    return {
      id: String(data.id),
      title: data.title ?? title,
      updatedAt: data.updated_at,
      messages: [],
    };
  },
  async sendMessage(sessionId: string, content: string): Promise<void> {
    await api.post(`/saathi/sessions/${sessionId}/messages`, { content });
  },
};

// ---------------------------------------------------------------------------
// Civic missions
// ---------------------------------------------------------------------------

const ACTION_TYPE_MAP: Record<string, MissionStepActionType> = {
  document: "document",
  form: "form",
  visit: "visit",
  confirm: "confirm",
  review: "review",
  research: "review",
  verify: "confirm",
  apply: "form",
  track: "review",
  prepare: "review",
};

function mapStepStatus(status: string): MissionStepStatus {
  if (status === "completed" || status === "complete") return "complete";
  if (status === "in_progress") return "in_progress";
  return "pending";
}

function mapStep(s: MissionStepOut): MissionStep {
  return {
    id: String(s.id),
    order: s.order,
    title: s.title,
    explanation: s.description ?? "",
    status: mapStepStatus(s.status),
    actionType: ACTION_TYPE_MAP[s.action_type ?? ""] ?? "review",
    relatedDocument: s.related_document ?? undefined,
  };
}

function mapMission(m: MissionOut): CivicMission {
  const steps = [...m.steps].sort((a, b) => a.order - b.order).map(mapStep);
  const nextStep = steps.find((s) => s.status !== "complete");
  const relatedId = m.related_service_ids?.[0];
  return {
    id: String(m.id),
    title: m.title,
    purpose: m.description ?? "",
    category: (m.category ?? "welfare") as ServiceCategory,
    status: (m.status as MissionStatus) ?? "active",
    relatedServiceId: relatedId != null ? idToSlug.get(relatedId) : undefined,
    nextBestAction: nextStep ? nextStep.title : "All steps complete",
    steps,
    createdAt: m.created_at,
  };
}

const CATEGORY_TEMPLATE: Record<string, string> = {
  healthcare: "healthcare_support",
  education: "education_support",
  employment: "employment_support",
};

export const missionService = {
  async list(): Promise<CivicMission[]> {
    await ensureServiceCache();
    const { data } = await api.get<MissionOut[]>("/missions");
    return data.map(mapMission);
  },
  async get(id: string): Promise<CivicMission | null> {
    await ensureServiceCache();
    try {
      const { data } = await api.get<MissionOut>(`/missions/${id}`);
      return mapMission(data);
    } catch {
      return null;
    }
  },
  async createFromService(serviceId: string): Promise<CivicMission> {
    await ensureServiceCache();
    const numericId = slugToId.get(serviceId);
    let body: Record<string, unknown>;
    if (numericId != null) {
      const category = idToCategory.get(numericId) ?? "general";
      body = {
        title: `Apply for ${humanize(serviceId.replace(/-/g, " "))}`,
        category,
        source_type: "recommendation",
        related_service_ids: [numericId],
        template_key: CATEGORY_TEMPLATE[category] ?? "general_civic",
      };
    } else {
      body = {
        title: "Civic action mission",
        category: "general",
        source_type: "ai_saathi",
        template_key: "general_civic",
      };
    }
    const { data } = await api.post<MissionOut>("/missions", body);
    return mapMission(data);
  },
  async setStepStatus(missionId: string, stepId: string, status: MissionStepStatus): Promise<void> {
    const action = status === "complete" ? "complete" : "uncomplete";
    await api.post(`/missions/${missionId}/steps/${stepId}/${action}`);
  },
};

// ---------------------------------------------------------------------------
// Documents / DocReady
// ---------------------------------------------------------------------------

function mapReadiness(r: ReadinessResponseOut): DocumentReadiness {
  const available: UserDocument[] = r.available_documents
    .filter((d) => d.status === "available")
    .map((d, i) => ({
      id: `available-${i}`,
      name: humanize(d.document_type),
      type: d.document_type,
      status: "available" as DocStatus,
      note: d.notes ?? undefined,
    }));
  const uncertain: UserDocument[] = r.uncertain_documents.map((d, i) => ({
    id: `uncertain-${i}`,
    name: humanize(d),
    type: d,
    status: "uncertain" as DocStatus,
  }));
  const missing: UserDocument[] = r.missing_documents.map((d, i) => ({
    id: `missing-${i}`,
    name: humanize(d),
    type: d,
    status: "missing" as DocStatus,
  }));
  return {
    contextTitle: r.service_name,
    contextType: "service",
    readinessPercent: Math.round(r.readiness_percentage),
    available,
    missing,
    uncertain,
    nextActions: r.next_actions ?? [],
  };
}

export const documentService = {
  async checkReadiness(
    serviceName: string,
    _requiredDocs: string[],
  ): Promise<DocumentReadiness | null> {
    await ensureServiceCache();
    const serviceId = nameToId.get(serviceName);
    if (serviceId == null) return null;
    const { data } = await api.post<ReadinessResponseOut>("/documents/readiness", {
      service_id: serviceId,
    });
    return mapReadiness(data);
  },
  async uploadDocument(file: File, documentType = "identity_proof"): Promise<void> {
    const form = new FormData();
    form.append("document_type", documentType);
    form.append("file", file);
    await api.post("/documents/upload", form);
  },
};

// ---------------------------------------------------------------------------
// Complaints / Drishti
// ---------------------------------------------------------------------------

function toSeverity(value: string): "low" | "medium" | "high" {
  if (value === "low" || value === "high") return value;
  return "medium";
}

function mapTimeline(events: TimelineEventOut[]): ComplaintTimelineEvent[] {
  return events.map((e) => ({
    id: String(e.id),
    stage: (e.status ?? e.event_type) as ComplaintStatus,
    title: humanize(e.event_type),
    timestamp: new Date(e.created_at).toLocaleString(),
    note: e.note ?? undefined,
  }));
}

function mapComplaint(c: ComplaintOut): Complaint {
  const verification: ResolutionVerification = {
    citizenVerified: "pending",
    authorityStatus: c.status as ComplaintStatus,
  };
  return {
    id: String(c.id),
    summary: c.title,
    description: c.description,
    category: c.category,
    severity: toSeverity(c.severity),
    department: c.suggested_department ?? "General Grievance Cell",
    location: {
      label: c.address ?? "Location not specified",
      lat: c.latitude ?? undefined,
      lng: c.longitude ?? undefined,
    },
    status: c.status as ComplaintStatus,
    supporterCount: c.supporter_count,
    createdAt: c.created_at,
    timeline: mapTimeline(c.timeline ?? []),
    verification,
  };
}

interface SubmitComplaintInput {
  description: string;
  category: string;
  severity: "low" | "medium" | "high";
  department: string;
  locationLabel: string;
  draft?: string;
}

export const complaintService = {
  async list(): Promise<Complaint[]> {
    const { data } = await api.get<ComplaintOut[]>("/complaints");
    return data.map(mapComplaint);
  },
  async get(id: string): Promise<Complaint | null> {
    try {
      const { data } = await api.get<ComplaintOut>(`/complaints/${id}`);
      return mapComplaint(data);
    } catch {
      return null;
    }
  },
  async analyzeIssue(description: string): Promise<ComplaintAnalysis> {
    const { data } = await api.post<ComplaintAnalysisOut>("/complaints/analyze", {
      description,
    });
    return {
      category: data.predicted_category,
      severity: toSeverity(data.severity_suggestion),
      department: data.suggested_department,
      draft: data.generated_draft,
      confidence: data.confidence,
      uncertainty: data.uncertainty_notes?.join(" ") || undefined,
    };
  },
  async findDuplicates(description: string, category = "other"): Promise<DuplicateIssue[]> {
    const { data } = await api.post<{ candidates: DuplicateCandidateOut[] }>(
      "/complaints/duplicates",
      { description, category },
    );
    return data.candidates.map((d) => ({
      id: String(d.complaint_id),
      summary: d.title,
      category: d.category,
      distanceKm: d.distance_km ?? 0,
      status: "reported" as ComplaintStatus,
      similarity: Math.round(d.similarity_score),
      supporterCount: d.supporter_count,
    }));
  },
  async submit(input: SubmitComplaintInput): Promise<Complaint> {
    const title = input.description.trim().slice(0, 80) || "Public issue report";
    const { data } = await api.post<ComplaintOut>("/complaints", {
      title,
      description: input.description,
      category: input.category,
      severity: input.severity,
      suggested_department: input.department,
      address: input.locationLabel,
      ai_draft: input.draft,
      user_confirmed: true,
    });
    return mapComplaint(data);
  },
  async verifyResolution(
    id: string,
    payload: { citizenVerified: "yes" | "no"; authorityStatus: ComplaintStatus; note?: string },
  ): Promise<void> {
    const action = payload.citizenVerified === "yes" ? "confirmed" : "disputed";
    await api.post(`/complaints/${id}/resolution`, { action, note: payload.note || undefined });
  },
  async joinIssue(id: string): Promise<void> {
    await api.post(`/complaints/${id}/join`);
  },
};
