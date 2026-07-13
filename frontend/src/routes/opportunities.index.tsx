import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { recommendationService } from "@/lib/api/services";
import type { Recommendation } from "@/types";
import { useI18n } from "@/i18n/i18n-context";
import {
  Search,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  XCircle,
  Radar,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const Route = createFileRoute("/opportunities/")({
  head: () => ({ meta: [{ title: "Opportunity Radar — NagrikOS" }] }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const { t } = useI18n();
  const [recs, setRecs] = useState<Recommendation[] | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [state, setState] = useState<string>("all");

  useEffect(() => {
    recommendationService.getRecommendations().then(setRecs);
  }, []);

  const filtered = useMemo(() => {
    if (!recs) return [];
    return recs.filter((r) => {
      if (cat !== "all" && r.service.category !== cat) return false;
      if (
        state !== "all" &&
        !r.service.stateApplicability.includes(state) &&
        !r.service.stateApplicability.includes("ALL")
      )
        return false;
      if (
        q &&
        !`${r.service.name} ${r.service.shortDescription}`.toLowerCase().includes(q.toLowerCase())
      )
        return false;
      return true;
    });
  }, [recs, q, cat, state]);

  return (
    <AppShell title={t("opps.title")}>
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-muted-foreground">{t("opps.subtitle")}</p>
      </div>

      <Card className="mb-4 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("opps.search")}
              className="pl-9"
            />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="senior_citizen">Senior citizen</SelectItem>
              <SelectItem value="housing">Housing</SelectItem>
            </SelectContent>
          </Select>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
              <SelectItem value="Karnataka">Karnataka</SelectItem>
              <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {!recs ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-40 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Radar className="h-6 w-6" />}
          title="No matches yet"
          description="Try broadening your filters or complete more of your profile."
          action={
            <Button asChild>
              <Link to="/profile">Update profile</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((r) => (
            <RecommendationCard key={r.id} rec={r} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const { t } = useI18n();
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {rec.service.category.replace("_", " ")}
          </div>
          <h3 className="mt-1 font-display text-lg font-semibold leading-tight">
            {rec.service.name}
          </h3>
        </div>
        <StatusBadge
          tone={rec.matchScore >= 75 ? "success" : rec.matchScore >= 55 ? "info" : "warning"}
        >
          {rec.matchScore}%
        </StatusBadge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{rec.reason}</p>
      <Progress value={rec.matchScore} className="mt-3 h-1.5" />

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Applies to: {rec.service.stateApplicability.join(", ")}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="sm" variant="secondary">
              {t("opps.why")}
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>{t("opps.why")}</SheetTitle>
              <SheetDescription>{rec.service.name}</SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-4 text-sm">
              <ExpBlock
                icon={<CheckCircle2 className="h-4 w-4 text-success" />}
                label={t("opps.matched")}
                items={rec.explanation.matched}
                tone="success"
              />
              <ExpBlock
                icon={<HelpCircle className="h-4 w-4 text-info" />}
                label={t("opps.uncertain")}
                items={rec.explanation.uncertain}
                tone="info"
              />
              <ExpBlock
                icon={<AlertTriangle className="h-4 w-4 text-warning" />}
                label={t("opps.missing")}
                items={rec.explanation.missing}
                tone="warning"
              />
              {rec.explanation.possibleMismatch.length > 0 && (
                <ExpBlock
                  icon={<XCircle className="h-4 w-4 text-destructive" />}
                  label={t("opps.mismatch")}
                  items={rec.explanation.possibleMismatch}
                  tone="danger"
                />
              )}
              <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                Potential match based on your profile. This is not official eligibility approval.
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Button size="sm" asChild>
          <Link to="/opportunities/$id" params={{ id: rec.service.id }}>
            View service <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

function ExpBlock({
  icon,
  label,
  items,
  tone: _tone,
}: {
  icon: React.ReactNode;
  label: string;
  items: string[];
  tone: "success" | "info" | "warning" | "danger";
}) {
  if (!items.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <ul className="mt-2 space-y-1">
        {items.map((i) => (
          <li key={i} className="rounded-md border bg-card px-3 py-1.5">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
