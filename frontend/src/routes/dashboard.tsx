import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
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
} from "@/lib/api/services";
import type {
  CivicMission,
  Complaint,
  Recommendation,
  CitizenProfile,
} from "@/types";
import { useI18n } from "@/i18n/i18n-context";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — NagrikOS" }],
  }),
  component: Dashboard,
});

const PROMPT_KEYS = [
  "dashboard.prompt.healthcare",
  "dashboard.prompt.education",
  "dashboard.prompt.business",
  "dashboard.prompt.pothole",
];

const STATUS_KEY_MAP: Record<string, string> = {
  active: "status.active",
  resolved: "status.resolved",
  citizen_verification: "status.citizenVerification",
  reported: "status.reported",
  ai_classified: "status.aiClassified",
  routed: "status.routed",
  acknowledged: "status.acknowledged",
  in_progress: "status.inProgress",
};

function Dashboard() {
  const { t } = useI18n();
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

  const activeMissions = missions.filter(
    (mission) => mission.status === "active",
  );

  const activeComplaints = complaints.filter(
    (complaint) => complaint.status !== "resolved",
  );

  const missionProgress = (mission: CivicMission) =>
    Math.round(
      (mission.steps.filter((step) => step.status === "complete").length /
        Math.max(mission.steps.length, 1)) *
        100,
    );

  function getStatusLabel(status: string) {
    const key = STATUS_KEY_MAP[status];
    return key ? t(key) : status.replace(/_/g, " ");
  }

  return (
    <AppShell title={t("nav.home")}>
      <section className="rounded-3xl border bg-card p-6 shadow-card lg:p-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          {t("nav.aiSaathi")}
        </div>

        <h2 className="mt-2 font-display text-2xl font-semibold lg:text-3xl">
          {t("dashboard.greeting")},{" "}
          {profile?.fullName?.split(" ")[0] ?? t("dashboard.friend")} 👋
        </h2>

        <p className="mt-1 text-muted-foreground">
          {t("dashboard.subtitle")}
        </p>

        <form
          className="mt-5 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();

            const q = prompt.trim();

            navigate({
              to: "/ai-saathi",
              search: q ? { q } : undefined,
            });
          }}
        >
          <input
            aria-label={t("dashboard.ask.ariaLabel")}
            placeholder={t("dashboard.ask.placeholder")}
            className="flex-1 rounded-xl border bg-background px-4 py-3 text-sm shadow-card outline-none focus:border-primary"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <Button type="submit" size="lg">
            {t("dashboard.ask.button")}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {PROMPT_KEYS.map((key) => {
            const translatedPrompt = t(key);

            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  navigate({
                    to: "/ai-saathi",
                    search: { q: translatedPrompt },
                  })
                }
                className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary"
              >
                {translatedPrompt}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            to: "/ai-saathi",
            icon: MessageSquareText,
            key: "dashboard.quick.ask",
          },
          {
            to: "/opportunities",
            icon: Radar,
            key: "dashboard.quick.find",
          },
          {
            to: "/docready",
            icon: FileCheck2,
            key: "dashboard.quick.docs",
          },
          {
            to: "/report-issue",
            icon: Megaphone,
            key: "dashboard.quick.report",
          },
        ].map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.to}
              to={action.to}
              className="group rounded-2xl border bg-card p-4 shadow-card transition hover:shadow-elevated"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="font-medium">
                  {t(action.key)}
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">
              {t("dashboard.readiness")}
            </h3>

            <StatusBadge tone="info">
              {profile?.completeness ?? 0}%
            </StatusBadge>
          </div>

          <ReadinessRow
            label={t("dashboard.readiness.profile")}
            value={profile?.completeness ?? 0}
          />

          <ReadinessRow
            label={t("dashboard.readiness.mission")}
            value={Math.round(
              activeMissions.reduce(
                (total, mission) => total + missionProgress(mission),
                0,
              ) / Math.max(activeMissions.length, 1),
            )}
          />

          <ReadinessRow
            label={t("dashboard.readiness.documents")}
            value={60}
          />

          <Button asChild variant="outline" className="mt-4 w-full">
            <Link to="/profile">
              {t("dashboard.updateProfile")}
            </Link>
          </Button>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Target className="h-4 w-4 text-primary" />
              {t("dashboard.activeMissions")}
            </h3>

            <Link
              to="/missions"
              className="text-sm text-primary hover:underline"
            >
              {t("common.viewAll")}
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {activeMissions.length === 0 && (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                {t("dashboard.missions.empty")}
              </div>
            )}

            {activeMissions.slice(0, 3).map((mission) => (
              <Link
                key={mission.id}
                to="/missions/$id"
                params={{ id: mission.id }}
                className="block rounded-xl border bg-background p-4 transition hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {mission.title}
                    </div>

                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {t("dashboard.next")}: {mission.nextBestAction}
                    </div>
                  </div>

                  <StatusBadge tone="success">
                    {missionProgress(mission)}%
                  </StatusBadge>
                </div>

                <Progress
                  value={missionProgress(mission)}
                  className="mt-3 h-1.5"
                />
              </Link>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Radar className="h-4 w-4 text-primary" />
              {t("dashboard.recommendations")}
            </h3>

            <Link
              to="/opportunities"
              className="text-sm text-primary hover:underline"
            >
              {t("dashboard.openRadar")}
            </Link>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {recs.slice(0, 4).map((recommendation) => (
              <Link
                key={recommendation.id}
                to="/opportunities/$id"
                params={{ id: recommendation.service.id }}
                className="rounded-xl border p-4 transition hover:border-primary/40"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-wide text-muted-foreground">
                    {recommendation.service.category.replace(/_/g, " ")}
                  </span>

                  <StatusBadge
                    tone={
                      recommendation.matchScore >= 75
                        ? "success"
                        : "info"
                    }
                  >
                    {recommendation.matchScore}%{" "}
                    {t("dashboard.match")}
                  </StatusBadge>
                </div>

                <div className="mt-2 font-medium">
                  {recommendation.service.name}
                </div>

                <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {recommendation.reason}
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Inbox className="h-4 w-4 text-primary" />
              {t("dashboard.activeComplaints")}
            </h3>

            <Link
              to="/complaints"
              className="text-sm text-primary hover:underline"
            >
              {t("common.viewAll")}
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {activeComplaints.length === 0 && (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                {t("dashboard.complaints.empty")}
              </div>
            )}

            {activeComplaints.slice(0, 3).map((complaint) => (
              <Link
                key={complaint.id}
                to="/complaints/$id"
                params={{ id: complaint.id }}
                className="block rounded-xl border bg-background p-3 hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-medium">
                    {complaint.summary}
                  </div>

                  <StatusBadge
                    tone={
                      complaint.status === "citizen_verification"
                        ? "warning"
                        : "info"
                    }
                  >
                    {getStatusLabel(complaint.status)}
                  </StatusBadge>
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  {complaint.category} · {complaint.location.label}
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}

function ReadinessRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
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