import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { complaintService } from "@/lib/api/services";
import type { ComplaintAnalysis, DuplicateIssue } from "@/types";
import { useI18n } from "@/i18n/i18n-context";
import { ArrowLeft, ArrowRight, Camera, MapPin, Loader2, Sparkles, Users, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/report-issue")({
  head: () => ({ meta: [{ title: "Report a public issue — NagrikOS" }] }),
  component: ReportPage,
});

const EXAMPLES = [
  "Large pothole near college gate",
  "Garbage has not been collected for 4 days",
  "Streetlight is broken",
  "Water is leaking continuously from the main pipe",
];

function ReportPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState("");
  const [imageName, setImageName] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ComplaintAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dupes, setDupes] = useState<DuplicateIssue[] | null>(null);
  const [dupLoading, setDupLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalSteps = 5;

  async function next() {
    if (step === 0 && description.trim().length < 10) return toast.error("Please add a bit more detail.");
    if (step === 1 && !locationLabel.trim()) return toast.error("Please add a location.");
    if (step === 1) {
      setAnalyzing(true); setStep(2);
      const a = await complaintService.analyzeIssue(description);
      setAnalysis(a); setAnalyzing(false);
      return;
    }
    if (step === 2) {
      setDupLoading(true); setStep(3);
      const d = await complaintService.findDuplicates(description, analysis?.category);
      setDupes(d); setDupLoading(false);
      return;
    }
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  async function submit() {
    if (!analysis) return;
    setSubmitting(true);
    const c = await complaintService.submit({
      description, category: analysis.category, severity: analysis.severity,
      department: analysis.department, locationLabel,
    });
    setSubmitting(false);
    toast.success("Complaint submitted");
    nav({ to: "/complaints/$id", params: { id: c.id } });
  }

  function useCurrentLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return toast.error("Geolocation not supported.");
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocationLabel(`Near ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`); setLocLoading(false); },
      () => { toast.error("Location permission denied."); setLocLoading(false); },
      { timeout: 6000 },
    );
  }

  const stepLabels = [t("report.step.describe"), t("report.step.location"), t("report.step.analysis"), t("report.step.duplicates"), t("report.step.review")];

  return (
    <AppShell title={t("report.title")}>
      <p className="mb-4 text-muted-foreground">{t("report.subtitle")}</p>

      <div className="mb-6 flex items-center gap-3 text-xs">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
            <span className={i === step ? "font-medium" : "text-muted-foreground"}>{label}</span>
          </div>
        ))}
      </div>
      <Progress value={((step + 1) / totalSteps) * 100} className="mb-6 h-1.5" />

      <Card className="p-6">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tell us what you see</label>
              <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. A large pothole has formed near the college gate…" className="mt-2" />
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((e) => <button key={e} type="button" onClick={() => setDescription(e)} className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary">{e}</button>)}
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-dashed p-4 text-sm cursor-pointer hover:border-primary/40">
              <Camera className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">Add a photo (optional)</div>
                <div className="text-xs text-muted-foreground">{imageName ?? "JPG or PNG"}</div>
              </div>
              <input type="file" accept="image/*" hidden onChange={(e) => setImageName(e.target.files?.[0]?.name ?? null)} />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Location</label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Input value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)} placeholder="Address or landmark" className="flex-1" />
                <Button type="button" variant="outline" onClick={useCurrentLocation} disabled={locLoading}>
                  {locLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                  Use current location
                </Button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Location is requested only when you tap the button.</div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground"><Sparkles className="h-4 w-4 text-accent" /> AI analysis</div>
            {analyzing || !analysis ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Analysing your report…</div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Info label="Category" value={analysis.category} />
                  <Info label="Severity" value={analysis.severity} tone={analysis.severity === "high" ? "danger" : analysis.severity === "medium" ? "warning" : "info"} />
                  <Info label="Suggested department" value={analysis.department} />
                </div>
                <div>
                  <label className="text-sm font-medium">Complaint draft (editable)</label>
                  <Textarea rows={5} value={analysis.draft} onChange={(e) => setAnalysis({ ...analysis, draft: e.target.value })} className="mt-2" />
                </div>
                {analysis.uncertainty && (
                  <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs">{analysis.uncertainty}</div>
                )}
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Similar issues may already be reported nearby.</div>
            {dupLoading || !dupes ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Searching nearby reports…</div>
            ) : dupes.length === 0 ? (
              <div className="rounded-xl border bg-muted/40 p-4 text-sm">No strong nearby match found.</div>
            ) : (
              dupes.map((d) => (
                <div key={d.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium">{d.summary}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{d.category} · {d.distanceKm} km away · <Users className="mr-0.5 inline h-3 w-3" />{d.supporterCount} supporters</div>
                    </div>
                    <StatusBadge tone="info">{d.similarity}% similar</StatusBadge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={async () => { try { await complaintService.joinIssue(d.id); toast.success("Joined existing issue"); } catch { toast.error("Could not join this issue."); } nav({ to: "/complaints" }); }}>Join existing issue</Button>
                  </div>
                </div>
              ))
            )}
            <div className="mt-2 text-xs text-muted-foreground"><ShieldCheck className="mr-1 inline h-3.5 w-3.5" /> Joining an existing issue can strengthen a shared civic signal.</div>
          </div>
        )}

        {step === 4 && analysis && (
          <div className="space-y-3 text-sm">
            <div className="font-display text-lg font-semibold">Review your report</div>
            <Row label="Description" value={description} />
            <Row label="Location" value={locationLabel} />
            <Row label="Category" value={analysis.category} />
            <Row label="Severity" value={analysis.severity} />
            <Row label="Department" value={analysis.department} />
            <Row label="Draft" value={analysis.draft} />
            {imageName && <Row label="Photo" value={imageName} />}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
          {step < totalSteps - 1 ? (
            <Button onClick={next} disabled={analyzing || dupLoading}>Continue <ArrowRight className="ml-1 h-4 w-4" /></Button>
          ) : (
            <Button onClick={submit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit report
            </Button>
          )}
        </div>
      </Card>
    </AppShell>
  );
}

function Info({ label, value, tone }: { label: string; value: string; tone?: "info" | "warning" | "danger" }) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1">{tone ? <StatusBadge tone={tone}>{value}</StatusBadge> : <span className="font-medium">{value}</span>}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 whitespace-pre-wrap">{value}</div>
    </div>
  );
}
