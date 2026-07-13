import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { servicesService, missionService } from "@/lib/api/services";
import type { ServiceScheme } from "@/types";
import {
  ExternalLink,
  Target,
  FileCheck2,
  MessageSquareText,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/opportunities/$id")({
  head: () => ({ meta: [{ title: "Service detail — NagrikOS" }] }),
  component: ServiceDetail,
});

function ServiceDetail() {
  const { id } = Route.useParams();
  const [svc, setSvc] = useState<ServiceScheme | null | undefined>(undefined);
  const nav = useNavigate();
  useEffect(() => {
    servicesService.byId(id).then((s) => setSvc(s ?? null));
  }, [id]);

  if (svc === undefined)
    return (
      <AppShell>
        <Card className="h-64 animate-pulse bg-muted/40" />
      </AppShell>
    );
  if (svc === null)
    return (
      <AppShell>
        <Card className="p-6">
          Service not found.{" "}
          <Link className="text-primary hover:underline" to="/opportunities">
            Back
          </Link>
        </Card>
      </AppShell>
    );

  return (
    <AppShell title={svc.name}>
      <Link
        to="/opportunities"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Opportunity Radar
      </Link>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {svc.category.replace("_", " ")}
          </div>
          <h1 className="mt-1 font-display text-2xl font-semibold">{svc.name}</h1>
          <p className="mt-2 text-muted-foreground">{svc.shortDescription}</p>

          <Section title="In simple words">{svc.simplifiedDescription}</Section>

          <Section title="Who this is for">
            <div className="flex flex-wrap gap-2">
              {svc.targetGroups.map((g) => (
                <StatusBadge key={g} tone="info">
                  {g}
                </StatusBadge>
              ))}
            </div>
          </Section>

          <Section title="Benefits">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {svc.benefits.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </Section>

          <Section title="Required documents">
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {svc.requiredDocuments.map((d) => (
                <li key={d} className="rounded-lg border bg-card px-3 py-2 text-sm">
                  {d}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="How to apply">
            <ol className="space-y-2 text-sm">
              {svc.applicationSteps.map((s, i) => (
                <li key={s} className="flex gap-3 rounded-lg border bg-card p-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </Section>

          <div className="mt-6 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
            Guidance summary from public sources. Please verify with the official portal before
            applying.
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Actions</div>
            <div className="mt-3 flex flex-col gap-2">
              <Button
                onClick={async () => {
                  const m = await missionService.createFromService(svc.id);
                  toast.success("Mission created");
                  nav({ to: "/missions/$id", params: { id: m.id } });
                }}
              >
                <Target className="mr-2 h-4 w-4" /> Create Civic Mission
              </Button>
              <Button variant="outline" asChild>
                <Link to="/docready" search={{ svc: svc.id }}>
                  <FileCheck2 className="mr-2 h-4 w-4" /> Check documents
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/ai-saathi" search={{ q: `Tell me more about ${svc.name}` }}>
                  <MessageSquareText className="mr-2 h-4 w-4" /> Ask AI Saathi
                </Link>
              </Button>
              <a
                href={svc.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Visit official source <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </Card>
          <Card className="p-5 text-sm">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Source</div>
            <div className="mt-2 font-medium">{svc.sourceName}</div>
            <div className="mt-1 text-muted-foreground">Last reviewed {svc.lastReviewed}</div>
            <div className="mt-3 text-xs text-muted-foreground">
              Applies to: {svc.stateApplicability.join(", ")}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="text-sm leading-relaxed">{children}</div>
    </section>
  );
}
