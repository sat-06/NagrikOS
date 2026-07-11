import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { missionService } from "@/lib/api/services";
import type { CivicMission, MissionStepStatus } from "@/types";
import { ArrowLeft, CheckCircle2, Circle, Loader2, FileText, MapPin, ClipboardCheck, ClipboardEdit } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/missions/$id")({
  head: () => ({ meta: [{ title: "Mission — NagrikOS" }] }),
  component: MissionDetail,
});

const ACTION_ICON = {
  document: FileText, form: ClipboardEdit, visit: MapPin, confirm: ClipboardCheck, review: ClipboardCheck,
} as const;

function MissionDetail() {
  const { id } = Route.useParams();
  const [m, setM] = useState<CivicMission | null | undefined>(undefined);

  const load = () => missionService.get(id).then((r) => setM(r ?? null));
  useEffect(() => { load(); }, [id]);

  if (m === undefined) return <AppShell><Card className="h-64 animate-pulse bg-muted/40" /></AppShell>;
  if (m === null) return <AppShell><Card className="p-6">Mission not found. <Link to="/missions" className="text-primary hover:underline">Back</Link></Card></AppShell>;

  const done = m.steps.filter((s) => s.status === "complete").length;
  const pct = Math.round((done / m.steps.length) * 100);

  async function setStatus(stepId: string, status: MissionStepStatus) {
    await missionService.setStepStatus(m!.id, stepId, status);
    await load();
    toast.success(status === "complete" ? "Step completed" : "Step updated");
  }

  return (
    <AppShell title={m.title}>
      <Link to="/missions" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Missions</Link>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <StatusBadge tone={m.status === "completed" ? "success" : "info"}>{m.status}</StatusBadge>
            <StatusBadge tone="neutral">{m.category.replace("_", " ")}</StatusBadge>
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold">{m.title}</h1>
          <p className="mt-1 text-muted-foreground">{m.purpose}</p>

          <div className="mt-5">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{done}/{m.steps.length} steps done</span>
              <span className="font-medium">{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>

          <div className="mt-6 rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-primary">Your next best action</div>
            <div className="mt-1 text-base font-medium">{m.nextBestAction}</div>
          </div>

          <ol className="mt-6 space-y-3">
            {m.steps.map((step) => {
              const Icon = ACTION_ICON[step.actionType];
              const complete = step.status === "complete";
              const inProgress = step.status === "in_progress";
              return (
                <li key={step.id} className={`flex gap-4 rounded-xl border p-4 ${complete ? "bg-success/5 border-success/30" : inProgress ? "bg-info/5 border-info/30" : "bg-card"}`}>
                  <button
                    type="button"
                    onClick={() => setStatus(step.id, complete ? "pending" : "complete")}
                    aria-label={complete ? "Mark step as incomplete" : "Mark step as complete"}
                    className="mt-0.5"
                  >
                    {complete ? <CheckCircle2 className="h-5 w-5 text-success" /> : inProgress ? <Loader2 className="h-5 w-5 animate-spin text-info" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className={`font-medium ${complete ? "line-through opacity-70" : ""}`}>{step.title}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{step.explanation}</p>
                    {step.relatedDocument && <div className="mt-2"><StatusBadge tone="warning">Needs: {step.relatedDocument}</StatusBadge></div>}
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        <div className="space-y-4">
          {m.relatedServiceId && (
            <Card className="p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Related service</div>
              <div className="mt-1 font-medium">{m.title.replace(/^Apply for /, "")}</div>
              <Button className="mt-3 w-full" asChild variant="outline">
                <Link to="/opportunities/$id" params={{ id: m.relatedServiceId }}>Open service</Link>
              </Button>
            </Card>
          )}
          <Card className="p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Get help</div>
            <div className="mt-3 flex flex-col gap-2">
              <Button variant="outline" asChild><Link to="/ai-saathi" search={{ q: `Help me with the mission: ${m.title}` }}>Ask AI Saathi</Link></Button>
              <Button variant="outline" asChild><Link to="/docready">Check documents</Link></Button>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
