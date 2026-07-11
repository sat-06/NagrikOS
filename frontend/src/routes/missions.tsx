import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { missionService } from "@/lib/api/services";
import type { CivicMission, MissionStatus } from "@/types";
import { Target, ArrowRight, MessageSquareText } from "lucide-react";
import { useI18n } from "@/i18n/i18n-context";

export const Route = createFileRoute("/missions")({
  head: () => ({ meta: [{ title: "My Missions — NagrikOS" }] }),
  component: MissionsPage,
});

function MissionsPage() {
  const { t } = useI18n();
  const [missions, setMissions] = useState<CivicMission[] | null>(null);
  useEffect(() => { missionService.list().then(setMissions); }, []);

  return (
    <AppShell title={t("missions.title")}>
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        {(["active", "completed", "archived"] as MissionStatus[]).map((status) => (
          <TabsContent key={status} value={status} className="mt-4">
            <MissionList missions={missions?.filter((m) => m.status === status) ?? null} />
          </TabsContent>
        ))}
      </Tabs>
    </AppShell>
  );
}

function MissionList({ missions }: { missions: CivicMission[] | null }) {
  if (!missions) return <div className="grid gap-3 md:grid-cols-2">{[...Array(2)].map((_, i) => <Card key={i} className="h-40 animate-pulse bg-muted/40" />)}</div>;
  if (missions.length === 0) return (
    <EmptyState icon={<Target className="h-6 w-6" />} title="You have no missions here yet" description="Ask AI Saathi to turn a question into a trackable mission." action={<Button asChild><Link to="/ai-saathi"><MessageSquareText className="mr-1 h-4 w-4" /> Ask AI Saathi</Link></Button>} />
  );
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {missions.map((m) => {
        const done = m.steps.filter((s) => s.status === "complete").length;
        const pct = Math.round((done / m.steps.length) * 100);
        return (
          <Link key={m.id} to="/missions/$id" params={{ id: m.id }} className="group rounded-2xl border bg-card p-5 shadow-card transition hover:shadow-elevated">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{m.category.replace("_", " ")}</div>
                <h3 className="mt-1 font-display text-lg font-semibold">{m.title}</h3>
              </div>
              <StatusBadge tone={m.status === "completed" ? "success" : m.status === "archived" ? "neutral" : "info"}>{m.status}</StatusBadge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{m.purpose}</p>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{done}/{m.steps.length} steps</span>
                <span className="font-medium">{pct}%</span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="truncate text-muted-foreground">Next: {m.nextBestAction}</span>
              <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
