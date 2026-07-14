import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/lib/auth/auth-context";
import {
  ArrowRight,
  MessageSquareText,
  Radar,
  FileCheck2,
  Megaphone,
  Target,
  Inbox,
  Sparkles,
} from "lucide-react";
import {
  profileService,
  missionService,
  recommendationService,
  complaintService,
  statsService,
} from "@/lib/api/services";
import type { CivicMission, Complaint, Recommendation, CitizenProfile } from "@/types";
import { useI18n } from "@/i18n/i18n-context";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — NagrikOS" }] }),
  component: Dashboard,
});

const PROMPTS = [
  "My mother needs healthcare support",
  "I need help for higher education",
  "I want to start a small business",
  "I want to report a pothole",
];

function DashboardStats() {
  const [stats, setStats] = useState<{
    active_missions: number;
    completed_missions: number;
    active_complaints: number;
    resolved_complaints: number;
    avg_mission_progress: number;
    profile_completeness: number;
    total_missions: number;
    total_complaints: number;
  } | null>(null);

  useEffect(() => {
    statsService.getDashboardStats().then(setStats).catch(() => null);
  }, []);

  if (!stats) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4 text-center">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Missions</div>
        <div className="mt-1 font-display text-2xl font-bold">{stats.total_missions}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {stats.completed_missions} completed · {stats.avg_mission_progress}% avg progress
        </div>
      </Card>
      <Card className="p-4 text-center">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Complaints</div>
        <div className="mt-1 font-display text-2xl font-bold">{stats.total_complaints}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {stats.resolved_complaints} resolved · {stats.active_complaints} active
        </div>
      </Card>
      <Card className="p-4 text-center">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Document Readiness</div>
        <div className="mt-1 font-display text-2xl font-bold">{stats.profile_completeness}%</div>
        <div className="mt-0.5 text-xs text-muted-foreground">Profile completeness</div>
      </Card>
      <Card className="p-4 text-center">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Next Best Action</div>
        <div className="mt-1 font-display text-2xl font-bold">
          {stats.active_missions > 0 ? "Continue" : "Start"}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {stats.active_missions > 0 ? `${stats.active_missions} mission(s) in progress` : "Begin your first mission"}
        </div>
      </Card>
    </div>
  );
}

function Dashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [missions, setMissions] = useState<CivicMission[]>([]);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      profileService.getProfile(),
      missionService.list(),
      recommendationService.getRecommendations(),
      complaintService.list(),
    ]).then(([p, m, r, c]) => {
      setProfile(p);
      setMissions(m);
      setRecs(r);
      setComplaints(c);
    });
  }, []);

  const activeMissions = missions.filter((m) => m.status === "active");
  const activeComplaints = complaints.filter((c) => c.status !== "resolved");
  const missionProgress = (m: CivicMission) =>
    Math.round((m.steps.filter((s) => s.status === "complete").length / m.steps.length) * 100);

  return (
    <AppShell title={t("nav.home")}>
      {/* Greeting + ask */}
      <section className="rounded-3xl border bg-card p-6 shadow-card lg:p-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-accent">
          <Sparkles className="h-3.5 w-3.5" /> AI Saathi
        </div>
        <h2 className="mt-2 font-display text-2xl font-semibold lg:text-3xl">
          {t("dashboard.greeting")},{" "}
          {(user?.fullName || profile?.fullName || "Friend").split(" ")[0]} 👋
        </h2>
        <p className="mt-1 text-muted-foreground">{t("dashboard.subtitle")}</p>

        <form
          className="mt-5 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            const q = prompt.trim();
            navigate({ to: "/ai-saathi", search: q ? { q } : undefined });
          }}
        >
          <input
            aria-label="Ask AI Saathi"
            placeholder={t("dashboard.ask.placeholder")}
            className="flex-1 rounded-xl border bg-background px-4 py-3 text-sm shadow-card outline-none focus:border-primary"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button type="submit" size="lg">
            Ask <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => navigate({ to: "/ai-saathi", search: { q: p } })}
              className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary"
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/ai-saathi", icon: MessageSquareText, k: "dashboard.quick.ask" },
          { to: "/opportunities", icon: Radar, k: "dashboard.quick.find" },
          { to: "/docready", icon: FileCheck2, k: "dashboard.quick.docs" },
          { to: "/report-issue", icon: Megaphone, k: "dashboard.quick.report" },
        ].map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="group rounded-2xl border bg-card p-4 shadow-card transition hover:shadow-elevated"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <q.icon className="h-5 w-5" />
              </div>
              <div className="font-medium">{t(q.k)}</div>
            </div>
          </Link>
        ))}
      </section>

      {/* At-a-glance stats */}
      <section className="mt-6">
        <DashboardStats />
      </section>

      {/* Row: readiness + missions */}
      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">{t("dashboard.readiness")}</h3>
            <StatusBadge tone="info">{profile?.completeness ?? 0}%</StatusBadge>
          </div>
          <ReadinessRow label="Profile completeness" value={profile?.completeness ?? 0} />
          <ReadinessRow
            label="Mission progress"
            value={Math.round(
              activeMissions.reduce((a, m) => a + missionProgress(m), 0) /
                Math.max(activeMissions.length, 1),
            )}
          />
          <ReadinessRow label="Document readiness" value={60} />
          <Button asChild variant="outline" className="mt-4 w-full">
            <Link to="/profile">Update profile</Link>
          </Button>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> {t("dashboard.activeMissions")}
            </h3>
            <Link to="/missions" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {activeMissions.length === 0 && (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                No active missions yet.
              </div>
            )}
            {activeMissions.slice(0, 3).map((m) => (
              <Link
                key={m.id}
                to="/missions/$id"
                params={{ id: m.id }}
                className="block rounded-xl border bg-background p-4 transition hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{m.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      Next: {m.nextBestAction}
                    </div>
                  </div>
                  <StatusBadge tone="success">{missionProgress(m)}%</StatusBadge>
                </div>
                <Progress value={missionProgress(m)} className="mt-3 h-1.5" />
              </Link>
            ))}
          </div>
        </Card>
      </section>

      {/* Row: recommendations + complaints */}
      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Radar className="h-4 w-4 text-primary" /> {t("dashboard.recommendations")}
            </h3>
            <Link to="/opportunities" className="text-sm text-primary hover:underline">
              Open Radar
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {recs.slice(0, 4).map((r) => (
              <Link
                key={r.id}
                to="/opportunities/$id"
                params={{ id: r.service.id }}
                className="rounded-xl border p-4 transition hover:border-primary/40"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-wide text-muted-foreground">
                    {r.service.category.replace("_", " ")}
                  </span>
                  <StatusBadge tone={r.matchScore >= 75 ? "success" : "info"}>
                    {r.matchScore}% match
                  </StatusBadge>
                </div>
                <div className="mt-2 font-medium">{r.service.name}</div>
                <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.reason}</div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Inbox className="h-4 w-4 text-primary" /> {t("dashboard.activeComplaints")}
            </h3>
            <Link to="/complaints" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {activeComplaints.length === 0 && (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                Nothing active.
              </div>
            )}
            {activeComplaints.slice(0, 3).map((c) => (
              <Link
                key={c.id}
                to="/complaints/$id"
                params={{ id: c.id }}
                className="block rounded-xl border bg-background p-3 hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-medium">{c.summary}</div>
                  <StatusBadge tone={c.status === "citizen_verification" ? "warning" : "info"}>
                    {c.status.replace(/_/g, " ")}
                  </StatusBadge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {c.category} · {c.location.label}
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}

function ReadinessRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-4">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}
