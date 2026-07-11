import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { profileService } from "@/lib/api/services";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import type { CitizenProfile, Language } from "@/types";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Set up your profile — NagrikOS" }] }),
  component: OnboardingPage,
});

const STEPS = ["Basics", "Location", "Situation", "Confirm"];

function OnboardingPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Partial<CitizenProfile>>({});

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [loading, isAuthenticated, navigate]);
  useEffect(() => { if (user) setData((d) => ({ ...d, fullName: d.fullName ?? user.fullName })); }, [user]);

  const progress = ((step + 1) / STEPS.length) * 100;

  async function finish() {
    setSaving(true);
    try {
      await profileService.saveProfile({ ...data, completeness: 80 });
      toast.success("Profile saved");
      navigate({ to: "/dashboard" });
    } finally { setSaving(false); }
  }

  return (
    <div className="min-h-dvh bg-surface px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <BrandMark />
          <span className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
        </div>
        <Progress value={progress} className="mb-6 h-1.5" />

        <Card className="p-6">
          <h1 className="font-display text-2xl font-semibold">{STEPS[step]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your profile helps NagrikOS surface more relevant civic opportunities. All fields are optional except your name.
          </p>

          <div className="mt-6 space-y-4">
            {step === 0 && (
              <>
                <Field label="Full name" required>
                  <Input value={data.fullName ?? ""} onChange={(e) => setData({ ...data, fullName: e.target.value })} />
                </Field>
                <Field label="Preferred language">
                  <Select value={data.preferredLanguage ?? "en"} onValueChange={(v) => setData({ ...data, preferredLanguage: v as Language })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिन्दी</SelectItem>
                      <SelectItem value="mr">मराठी</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Age (optional)">
                  <Input type="number" min={1} max={120} value={data.age ?? ""} onChange={(e) => setData({ ...data, age: e.target.value ? Number(e.target.value) : undefined })} />
                </Field>
              </>
            )}
            {step === 1 && (
              <>
                <Field label="State (optional)">
                  <Input placeholder="e.g. Maharashtra" value={data.state ?? ""} onChange={(e) => setData({ ...data, state: e.target.value })} />
                </Field>
                <Field label="District (optional)">
                  <Input placeholder="e.g. Pune" value={data.district ?? ""} onChange={(e) => setData({ ...data, district: e.target.value })} />
                </Field>
              </>
            )}
            {step === 2 && (
              <>
                <Field label="Occupation (optional)">
                  <Input placeholder="e.g. Student, Farmer, Shopkeeper" value={data.occupation ?? ""} onChange={(e) => setData({ ...data, occupation: e.target.value })} />
                </Field>
                <Field label="Annual household income band (optional)">
                  <Select value={data.incomeBand ?? ""} onValueChange={(v) => setData({ ...data, incomeBand: v as CitizenProfile["incomeBand"] })}>
                    <SelectTrigger><SelectValue placeholder="Select band" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="below_1L">Below ₹1 lakh</SelectItem>
                      <SelectItem value="1L_3L">₹1L – ₹3L</SelectItem>
                      <SelectItem value="3L_6L">₹3L – ₹6L</SelectItem>
                      <SelectItem value="6L_12L">₹6L – ₹12L</SelectItem>
                      <SelectItem value="above_12L">Above ₹12L</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={!!data.isStudent} onCheckedChange={(v) => setData({ ...data, isStudent: !!v })} /> I am a student
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={!!data.isFarmer} onCheckedChange={(v) => setData({ ...data, isFarmer: !!v })} /> I am a farmer
                  </label>
                </div>
              </>
            )}
            {step === 3 && (
              <div className="rounded-xl border bg-muted/40 p-4 text-sm">
                <div className="mb-2 font-medium">Review</div>
                <dl className="grid grid-cols-2 gap-y-2">
                  {Object.entries(data).map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</dt>
                      <dd>{String(v ?? "—")}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Your data stays in this browser for the demo.</span>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 0 && !data.fullName?.trim()}
              >Continue</Button>
            ) : (
              <Button onClick={finish} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Finish
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{required && <span className="ml-1 text-destructive">*</span>}</Label>
      {children}
    </div>
  );
}
