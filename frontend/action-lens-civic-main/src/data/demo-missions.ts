import type { CivicMission } from "@/types";

export const demoMissions: CivicMission[] = [
  {
    id: "mis-scholarship",
    title: "Apply for MahaDBT Post-Matric Scholarship",
    purpose: "Get financial support for your college tuition and maintenance.",
    category: "education",
    status: "active",
    relatedServiceId: "svc-mahadbt-scholarship",
    nextBestAction: "Upload or obtain your income certificate",
    createdAt: "2025-06-01",
    steps: [
      { id: "s1", order: 1, title: "Create MahaDBT profile", explanation: "Register on the MahaDBT portal using Aadhaar-linked mobile.", status: "complete", actionType: "form" },
      { id: "s2", order: 2, title: "Upload domicile certificate", explanation: "Proof that you are a Maharashtra resident.", status: "complete", actionType: "document", relatedDocument: "Domicile Certificate" },
      { id: "s3", order: 3, title: "Upload income certificate", explanation: "Family income certificate from Tahsildar / e-Seva.", status: "in_progress", actionType: "document", relatedDocument: "Income Certificate" },
      { id: "s4", order: 4, title: "Institute verification", explanation: "Submit application, then request college to verify.", status: "pending", actionType: "visit" },
      { id: "s5", order: 5, title: "Confirm scholarship credit", explanation: "Confirm DBT credit into your bank account after approval.", status: "pending", actionType: "confirm" },
    ],
  },
  {
    id: "mis-ayushman",
    title: "Enroll mother in Ayushman Bharat (PMJAY)",
    purpose: "Get cashless hospital cover for elderly parent.",
    category: "healthcare",
    status: "active",
    relatedServiceId: "svc-ayushman",
    nextBestAction: "Check family eligibility on PMJAY portal",
    createdAt: "2025-06-15",
    steps: [
      { id: "a1", order: 1, title: "Check eligibility", explanation: "Verify family entry on official PMJAY portal.", status: "in_progress", actionType: "review" },
      { id: "a2", order: 2, title: "Prepare Aadhaar & ration card", explanation: "Both are needed for KYC at hospital.", status: "pending", actionType: "document", relatedDocument: "Aadhaar Card" },
      { id: "a3", order: 3, title: "Visit Ayushman Mitra desk", explanation: "At an empanelled hospital or CSC.", status: "pending", actionType: "visit" },
      { id: "a4", order: 4, title: "Collect PMJAY card", explanation: "You'll receive the family card after verification.", status: "pending", actionType: "confirm" },
    ],
  },
  {
    id: "mis-business",
    title: "Explore MUDRA loan for small tea stall",
    purpose: "Understand loan requirements and prepare a simple business plan.",
    category: "business",
    status: "archived",
    relatedServiceId: "svc-mudra",
    nextBestAction: "Prepare a one-page business plan",
    createdAt: "2025-04-20",
    steps: [
      { id: "b1", order: 1, title: "Draft business plan", explanation: "One-page overview: what, where, cost, income.", status: "complete", actionType: "form" },
      { id: "b2", order: 2, title: "List required documents", explanation: "Aadhaar, PAN, address proof.", status: "complete", actionType: "document" },
      { id: "b3", order: 3, title: "Visit participating bank", explanation: "Any nationalised bank branch.", status: "pending", actionType: "visit" },
    ],
  },
];
