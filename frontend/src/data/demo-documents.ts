import type { UserDocument, DocumentReadiness } from "@/types";

export const demoDocuments: UserDocument[] = [
  { id: "d1", name: "Aadhaar Card", type: "Identity", status: "available", uploadedAt: "2025-05-01" },
  { id: "d2", name: "PAN Card", type: "Identity", status: "available", uploadedAt: "2025-05-01" },
  { id: "d3", name: "Domicile Certificate", type: "Address", status: "uncertain", note: "Date should be checked for freshness." },
  { id: "d4", name: "Income Certificate", type: "Financial", status: "missing" },
  { id: "d5", name: "Caste Certificate", type: "Social", status: "missing" },
  { id: "d6", name: "College ID", type: "Education", status: "available", uploadedAt: "2025-06-01" },
];

export function computeReadiness(contextTitle: string, required: string[]): DocumentReadiness {
  const available: UserDocument[] = [];
  const missing: UserDocument[] = [];
  const uncertain: UserDocument[] = [];
  for (const req of required) {
    const doc = demoDocuments.find((d) => d.name === req);
    if (!doc) {
      missing.push({ id: `synth-${req}`, name: req, type: "Required", status: "missing" });
      continue;
    }
    if (doc.status === "available") available.push(doc);
    else if (doc.status === "uncertain" || doc.status === "expiring") uncertain.push(doc);
    else missing.push(doc);
  }
  const total = required.length || 1;
  const pct = Math.round(((available.length + uncertain.length * 0.5) / total) * 100);
  return {
    contextTitle,
    contextType: "service",
    readinessPercent: pct,
    available,
    missing,
    uncertain,
    nextActions: missing.map((d) => `Obtain ${d.name}`).concat(uncertain.map((d) => `Verify ${d.name}`)),
  };
}
