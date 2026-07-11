import type { ChatSession } from "@/types";
import { demoServices } from "./demo-services";

export const demoChatSessions: ChatSession[] = [
  {
    id: "chat-1",
    title: "Healthcare support for mother",
    updatedAt: "2025-07-01",
    messages: [
      {
        id: "m1", role: "user", createdAt: "2025-07-01T10:00:00Z",
        content: "My mother is 62 and needs healthcare support. We live in Pune.",
      },
      {
        id: "m2", role: "assistant", createdAt: "2025-07-01T10:00:04Z", status: "complete",
        content: "Here's what I understood and a few directions that may help.",
        understoodSituation: {
          primaryNeed: "Healthcare support",
          personContext: "Elderly parent",
          known: { Age: "62", Location: "Pune, Maharashtra" },
          missing: ["Household income band", "Ration card status"],
          categories: ["Healthcare", "Senior Citizen Support"],
        },
        suggestedActions: [
          { title: "Confirm your income band", description: "This helps refine eligibility for centrally-sponsored schemes." },
          { title: "Check Ayushman Bharat (PMJAY) eligibility", description: "Cashless hospital cover up to ₹5 lakh per family." },
          { title: "Explore Rashtriya Vayoshri Yojana", description: "Free assisted-living devices for eligible seniors." },
          { title: "Turn this into a Civic Mission", description: "So you can track next steps and documents." },
        ],
        relatedServices: [demoServices[0], demoServices[1]],
        sources: [
          { title: "PMJAY — National Health Authority", url: "https://pmjay.gov.in" },
          { title: "Rashtriya Vayoshri Yojana", url: "https://socialjustice.gov.in" },
        ],
        uncertainty: "We still need your household income band and ration-card status to sharpen this recommendation.",
        disclaimer: "NagrikOS provides guidance only. Final eligibility should be verified through official sources.",
      },
    ],
  },
  {
    id: "chat-2",
    title: "Financial help for higher education",
    updatedAt: "2025-06-20",
    messages: [
      { id: "e1", role: "user", createdAt: "2025-06-20T09:00:00Z", content: "I need financial help for higher education." },
      {
        id: "e2", role: "assistant", createdAt: "2025-06-20T09:00:03Z", status: "complete",
        content: "There are both state and central options that may fit a student in Maharashtra.",
        understoodSituation: {
          primaryNeed: "Scholarship for higher education",
          known: { Student: "Yes", Location: "Maharashtra" },
          missing: ["Income certificate", "Caste category"],
          categories: ["Education", "Financial Support"],
        },
        suggestedActions: [
          { title: "Prepare your income certificate", description: "Required for most scholarships." },
          { title: "Start with MahaDBT (state)", description: "Maharashtra post-matric scholarships live on MahaDBT." },
          { title: "Also register on NSP (central)", description: "Central scholarships that can stack for eligible categories." },
        ],
        relatedServices: [demoServices[4], demoServices[2]],
        sources: [
          { title: "MahaDBT Portal", url: "https://mahadbt.maharashtra.gov.in" },
          { title: "National Scholarship Portal", url: "https://scholarships.gov.in" },
        ],
        uncertainty: "Category (SC/ST/OBC/General) and household income are needed to confirm eligibility.",
        disclaimer: "NagrikOS provides guidance only. Please verify with official portals.",
      },
    ],
  },
];
