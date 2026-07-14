import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { profileService } from "@/lib/api/services";
import type { CitizenProfile, Language } from "@/types";
import { useI18n } from "@/i18n/i18n-context";
import {
  Loader2,
  ShieldCheck,
  MessageSquareText,
  Radar,
  Target,
  FileCheck2,
  Megaphone,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useState as useGuideState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — NagrikOS" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t, setLang } = useI18n();
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileService.getProfile().then(setProfile);
  }, []);

  async function save() {
    if (!profile) return;
    setSaving(true);
    const p = await profileService.saveProfile(profile);
    setProfile(p);
    setLang(p.preferredLanguage);
    setSaving(false);
    toast.success("Profile saved");
  }

  if (!profile)
    return (
      <AppShell title={t("nav.profile")}>
        <Card className="h-64 animate-pulse bg-muted/40" />
      </AppShell>
    );

  return (
    <AppShell title={t("nav.profile")}>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold">Personal details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <F label="Full name">
              <Input
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              />
            </F>
            <F label="Preferred language">
              <Select
                value={profile.preferredLanguage}
                onValueChange={(v) => setProfile({ ...profile, preferredLanguage: v as Language })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                  <SelectItem value="mr">मराठी</SelectItem>
                </SelectContent>
              </Select>
            </F>
            <F label="State">
              <Input
                value={profile.state ?? ""}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              />
            </F>
            <F label="District">
              <Input
                value={profile.district ?? ""}
                onChange={(e) => setProfile({ ...profile, district: e.target.value })}
              />
            </F>
            <F label="Age">
              <Input
                type="number"
                value={profile.age ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    age: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </F>
            <F label="Occupation">
              <Input
                value={profile.occupation ?? ""}
                onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
              />
            </F>
            <F label="Income band">
              <Select
                value={profile.incomeBand ?? ""}
                onValueChange={(v) =>
                  setProfile({ ...profile, incomeBand: v as CitizenProfile["incomeBand"] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="below_1L">Below ₹1L</SelectItem>
                  <SelectItem value="1L_3L">₹1L – ₹3L</SelectItem>
                  <SelectItem value="3L_6L">₹3L – ₹6L</SelectItem>
                  <SelectItem value="6L_12L">₹6L – ₹12L</SelectItem>
                  <SelectItem value="above_12L">Above ₹12L</SelectItem>
                </SelectContent>
              </Select>
            </F>
          </div>
          <div className="mt-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={!!profile.isStudent}
                onCheckedChange={(v) => setProfile({ ...profile, isStudent: !!v })}
              />{" "}
              Student
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={!!profile.isFarmer}
                onCheckedChange={(v) => setProfile({ ...profile, isFarmer: !!v })}
              />{" "}
              Farmer
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save changes
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Profile completeness
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold">{profile.completeness}%</span>
              <span className="text-sm text-muted-foreground">of your profile is filled</span>
            </div>
            <Progress value={profile.completeness} className="mt-2 h-2" />
            <div className="mt-3 text-xs text-muted-foreground">
              More details = sharper opportunity matches.
            </div>
          </Card>
          <Card className="p-5 text-xs text-muted-foreground">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5" /> Your details are saved securely to
            your NagrikOS account.
          </Card>
        </div>
      </div>

      {/* User Guide Section */}
      <GuideSection />

    </AppShell>
  );
}

function GuideSection() {
  const [expandedSection, setExpandedSection] = useGuideState<string | null>(null);

    const guides = [
    {
      id: "ai-saathi",
      icon: MessageSquareText,
      title: "AI Saathi — Ask Anything",
      color: "text-violet-600",
      bg: "bg-violet-500/10",
      steps: [
        "Go to AI Saathi from the sidebar or type your question on the Dashboard.",
        "Describe your situation in plain English, Hindi, or Marathi.",
        "AI Saathi will show what it understood, suggested next actions, and matching schemes.",
        "Click Turn into a Civic Mission to track your application step-by-step.",
        "Upload documents and complete each step to finish your mission.",
      ],
    },
    {
      id: "opportunities",
      icon: Radar,
      title: "Opportunity Radar — Find Schemes",
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      steps: [
        "Go to Opportunity Radar from the sidebar.",
        "You will see government schemes matched to your profile, sorted by fit.",
        "Each scheme shows match percentage, what matched, what is uncertain, and what is missing.",
        "Click any scheme to see full details: benefits, documents, application steps, and official source.",
        "Start a Civic Mission directly from any scheme to begin your application journey.",
      ],
    },
    {
      id: "missions",
      icon: Target,
      title: "Civic Missions — Track Progress",
      color: "text-blue-600",
      bg: "bg-blue-500/10",
      steps: [
        "Missions break a government scheme into simple, trackable steps.",
        "Each mission shows your progress (%), next best action, and all steps with status.",
        "Mark steps as complete as you finish them: upload documents, fill forms, visit offices.",
        "Use the Tabs (Active / Completed / Archived) to organize your missions.",
        "AI Saathi and Opportunity Radar can both create new missions in one click.",
      ],
    },
    {
      id: "docready",
      icon: FileCheck2,
      title: "DocReady AI — Check Documents",
      color: "text-amber-600",
      bg: "bg-amber-500/10",
      steps: [
        "Go to DocReady from the sidebar.",
        "Select a service or scheme from the dropdown to see your document readiness.",
        "DocReady shows your readiness %, which documents you have, which are Missing, and which need review.",
        "Drag and drop or browse to upload your documents (PDF, JPG, or PNG).",
        "Documents are stored securely. They help NagrikOS tell you exactly what to gather before applying.",
      ],
    },
    {
      id: "complaints",
      icon: Megaphone,
      title: "Drishti Report — File Complaints",
      color: "text-red-600",
      bg: "bg-red-500/10",
      steps: [
        "Go to Report Issue from the sidebar.",
        "Describe your civic issue (pothole, garbage, streetlight, etc.). AI will auto-classify it.",
        "Add the location so nearby duplicates can be detected.",
        "Review the AI analysis: predicted category, severity, and generated complaint draft.",
        "Confirm and submit. Track your complaint status on the Complaints page.",
      ],
    },
    {
      id: "profile",
      icon: BookOpen,
      title: "Profile — Get Better Matches",
      color: "text-cyan-600",
      bg: "bg-cyan-500/10",
      steps: [
        "Fill your profile as completely as possible. More details equal better scheme matches.",
        "Key fields: State, District, Age, Income Band, Occupation.",
        "Check Student or Farmer if applicable. Many schemes are targeted to specific groups.",
        "Save your profile. It is stored securely and never shared.",
        "A complete profile typically improves match scores by 20 to 40 percent.",
      ],
    },
  ];

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-semibold">How to Use NagrikOS</h2>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        A complete guide to every feature. Click any section to expand step-by-step instructions.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((g) => {
          const Icon = g.icon;
          const isOpen = expandedSection === g.id;
          return (
            <Card
              key={g.id}
              className={`cursor-pointer p-5 transition-all hover:shadow-elevated ${isOpen ? "ring-2 ring-primary/20" : ""}`}
              onClick={() => setExpandedSection(isOpen ? null : g.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${g.bg} ${g.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{g.title}</div>
                    <div className="text-xs text-muted-foreground">{g.steps.length} steps</div>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </div>
              {isOpen && (
                <ol className="mt-4 space-y-2 border-t pt-3">
                  {g.steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs">
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
