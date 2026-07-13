import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { complaintService } from "@/lib/api/services";
import type { Complaint } from "@/types";
import { useI18n } from "@/i18n/i18n-context";
import { Inbox, MapPin, Users, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/complaints/")({
  head: () => ({ meta: [{ title: "My Complaints — NagrikOS" }] }),
  component: ComplaintsPage,
});

function ComplaintsPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<Complaint[] | null>(null);
  useEffect(() => { complaintService.list().then(setItems); }, []);

  const filter = (fn: (c: Complaint) => boolean) => (items ? items.filter(fn) : null);

  return (
    <AppShell title={t("complaints.title")}>
      <div className="mb-4 flex justify-between">
        <p className="text-muted-foreground">Track your public issue reports and verify resolutions.</p>
        <Button asChild><Link to="/report-issue">Report new issue</Link></Button>
      </div>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="verify">Awaiting verification</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4"><List items={items} /></TabsContent>
        <TabsContent value="active" className="mt-4"><List items={filter((c) => c.status !== "resolved" && c.status !== "citizen_verification")} /></TabsContent>
        <TabsContent value="verify" className="mt-4"><List items={filter((c) => c.status === "citizen_verification")} /></TabsContent>
        <TabsContent value="resolved" className="mt-4"><List items={filter((c) => c.status === "resolved")} /></TabsContent>
      </Tabs>
    </AppShell>
  );
}

function List({ items }: { items: Complaint[] | null }) {
  if (!items) return <div className="grid gap-3 md:grid-cols-2">{[...Array(2)].map((_, i) => <Card key={i} className="h-32 animate-pulse bg-muted/40" />)}</div>;
  if (items.length === 0) return <EmptyState icon={<Inbox className="h-6 w-6" />} title="No public issues here yet" action={<Button asChild><Link to="/report-issue">Report an issue</Link></Button>} />;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((c) => (
        <Link key={c.id} to="/complaints/$id" params={{ id: c.id }} className="group rounded-2xl border bg-card p-5 shadow-card transition hover:shadow-elevated">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.category}</div>
              <h3 className="mt-1 font-display text-lg font-semibold leading-tight">{c.summary}</h3>
            </div>
            <StatusBadge tone={c.status === "resolved" ? "success" : c.status === "citizen_verification" ? "warning" : "info"}>{c.status.replace(/_/g, " ")}</StatusBadge>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location.label}</span>
            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{c.supporterCount}</span>
            <span>{new Date(c.createdAt).toLocaleDateString()}</span>
            <span className="ml-auto inline-flex items-center gap-1 text-primary opacity-0 transition group-hover:opacity-100">Details <ArrowRight className="h-3 w-3" /></span>
          </div>
        </Link>
      ))}
    </div>
  );
}
