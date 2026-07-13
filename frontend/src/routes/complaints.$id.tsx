import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { complaintService } from "@/lib/api/services";
import type { Complaint, ComplaintStatus } from "@/types";
import { useI18n } from "@/i18n/i18n-context";
import { ArrowLeft, CheckCircle2, Circle, Loader2, MapPin, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/complaints/$id")({
  head: () => ({ meta: [{ title: "Complaint — NagrikOS" }] }),
  component: ComplaintDetail,
});

const STAGES: { key: ComplaintStatus; label: string }[] = [
  { key: "reported", label: "Reported" },
  { key: "ai_classified", label: "AI Classified" },
  { key: "routed", label: "Routed" },
  { key: "acknowledged", label: "Acknowledged" },
  { key: "in_progress", label: "In progress" },
  { key: "citizen_verification", label: "Citizen verification" },
  { key: "resolved", label: "Resolved" },
];

function ComplaintDetail() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const [c, setC] = useState<Complaint | null | undefined>(undefined);
  const [note, setNote] = useState("");

  const load = () => complaintService.get(id).then((r) => setC(r ?? null));
  useEffect(() => {
    load();
  }, [id]);

  if (c === undefined)
    return (
      <AppShell>
        <Card className="h-64 animate-pulse bg-muted/40" />
      </AppShell>
    );
  if (c === null)
    return (
      <AppShell>
        <Card className="p-6">
          Complaint not found.{" "}
          <Link className="text-primary hover:underline" to="/complaints">
            Back
          </Link>
        </Card>
      </AppShell>
    );

  const currentIdx = STAGES.findIndex((s) => s.key === c.status);

  async function verify(kind: "yes" | "no") {
    await complaintService.verifyResolution(c!.id, {
      citizenVerified: kind,
      authorityStatus: c!.verification.authorityStatus,
      note,
    });
    await load();
    toast.success(
      kind === "yes" ? "Thanks for confirming!" : "We've noted this is still unresolved.",
    );
  }

  return (
    <AppShell title={c.summary}>
      <Link
        to="/complaints"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Complaints
      </Link>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                tone={
                  c.status === "resolved"
                    ? "success"
                    : c.status === "citizen_verification"
                      ? "warning"
                      : "info"
                }
              >
                {c.status.replace(/_/g, " ")}
              </StatusBadge>
              <StatusBadge tone="neutral">{c.category}</StatusBadge>
              <StatusBadge
                tone={
                  c.severity === "high" ? "danger" : c.severity === "medium" ? "warning" : "info"
                }
              >
                {c.severity} severity
              </StatusBadge>
            </div>
            <h1 className="mt-2 font-display text-2xl font-semibold">{c.summary}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {c.location.label}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {c.supporterCount} {t("complaints.supporters")}
              </span>
              <span>Department: {c.department}</span>
              <span>Reported {new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold">{t("complaints.timeline")}</h2>
            <ol className="mt-4">
              {STAGES.map((stage, i) => {
                const evt = c.timeline.find((e) => e.stage === stage.key);
                const done = i < currentIdx || (i === currentIdx && !!evt);
                const current = i === currentIdx;
                return (
                  <li key={stage.key} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={`grid h-8 w-8 place-items-center rounded-full border-2 ${done ? "border-success bg-success text-success-foreground" : current ? "border-info bg-info/10 text-info" : "border-border text-muted-foreground"}`}
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : current ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </div>
                      {i < STAGES.length - 1 && (
                        <div className={`mt-1 w-0.5 flex-1 ${done ? "bg-success" : "bg-border"}`} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{evt?.title ?? stage.label}</span>
                        {evt?.timestamp && (
                          <span className="text-xs text-muted-foreground">· {evt.timestamp}</span>
                        )}
                      </div>
                      {evt?.note && (
                        <div className="mt-1 text-sm text-muted-foreground">{evt.note}</div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>

        {/* Verification */}
        <div>
          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold">{t("complaints.verify.title")}</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between rounded-lg border bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">Authority status</span>
                <span className="font-medium capitalize">
                  {c.verification.authorityStatus.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between rounded-lg border bg-muted/40 px-3 py-2">
                <span className="text-muted-foreground">Your verification</span>
                <span className="font-medium capitalize">{c.verification.citizenVerified}</span>
              </div>
            </div>
            <Textarea
              className="mt-4"
              rows={3}
              placeholder="Optional note about the ground reality…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="mt-3 flex flex-col gap-2">
              <Button onClick={() => verify("yes")}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> {t("complaints.verify.yes")}
              </Button>
              <Button variant="outline" onClick={() => verify("no")}>
                {t("complaints.verify.no")}
              </Button>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Your citizen verification is separate from the authority's status — both are shown
              together for transparency.
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
