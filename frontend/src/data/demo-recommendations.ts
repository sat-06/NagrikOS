import type { Recommendation } from "@/types";
import { demoServices } from "./demo-services";

const svc = (id: string) => demoServices.find((s) => s.id === id)!;

export const demoRecommendations: Recommendation[] = [
  {
    id: "rec-1",
    service: svc("svc-ayushman"),
    matchScore: 88,
    reason: "Your household context and the mention of an elderly parent align with PMJAY coverage.",
    explanation: {
      matched: ["Family context suggests hospitalization support may help", "Available across India"],
      uncertain: ["Household income band not confirmed"],
      missing: ["Family / ration card status not yet shared"],
      possibleMismatch: [],
    },
  },
  {
    id: "rec-2",
    service: svc("svc-vayoshri"),
    matchScore: 74,
    reason: "Elderly parent (60+) mentioned; scheme provides free assistive devices for eligible seniors.",
    explanation: {
      matched: ["Age indicator 60+"],
      uncertain: ["BPL status not confirmed"],
      missing: ["Age proof upload"],
      possibleMismatch: [],
    },
  },
  {
    id: "rec-3",
    service: svc("svc-mahadbt-scholarship"),
    matchScore: 81,
    reason: "You are a student in Maharashtra; MahaDBT covers state post-matric scholarships.",
    explanation: {
      matched: ["Student profile", "Maharashtra domicile likely"],
      uncertain: ["Income certificate not yet uploaded"],
      missing: ["Caste certificate (if applicable)"],
      possibleMismatch: [],
    },
  },
  {
    id: "rec-4",
    service: svc("svc-nsp"),
    matchScore: 69,
    reason: "Central scholarship option that complements the Maharashtra state one.",
    explanation: {
      matched: ["Student profile"],
      uncertain: ["Category eligibility"],
      missing: ["Income certificate"],
      possibleMismatch: [],
    },
  },
  {
    id: "rec-5",
    service: svc("svc-mudra"),
    matchScore: 52,
    reason: "If you plan to start a small business, MUDRA offers collateral-free loans.",
    explanation: {
      matched: ["Interest in entrepreneurship possible"],
      uncertain: ["Business plan readiness"],
      missing: ["Formal business proof"],
      possibleMismatch: ["Currently a full-time student"],
    },
  },
  {
    id: "rec-6",
    service: svc("svc-pmay"),
    matchScore: 41,
    reason: "Potentially useful in future if planning first home purchase.",
    explanation: {
      matched: ["Urban household"],
      uncertain: ["Income band"],
      missing: ["Property intent"],
      possibleMismatch: [],
    },
  },
];
