import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n/i18n-context";
import { statsService } from "@/lib/api/services";
import {
  MessageSquareText,
  Radar,
  Target,
  FileCheck2,
  Megaphone,
  ShieldCheck,
  ArrowRight,
  Sparkle,
  Layers,
  LayoutGrid,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NagrikOS — AI that turns civic confusion into action" },
      {
        name: "description",
        content:
          "Describe what you need in your own words. NagrikOS surfaces relevant government services, prepares documents, and turns them into trackable civic missions.",
      },
    ],
  }),
  component: Landing,
});

const CAPABILITIES = [
  {
    icon: MessageSquareText,
    title: "AI Saathi",
    body: "Describe your situation naturally — in English, हिन्दी, or मराठी. Get grounded, transparent guidance.",
  },
  {
    icon: Radar,
    title: "Opportunity Radar",
    body: "Personalised government scheme matches with a clear ‘why this matches you’ explanation.",
  },
  {
    icon: Target,
    title: "Civic Missions",
    body: "Turn a scheme into a step-by-step journey with your next best action always visible.",
  },
  {
    icon: FileCheck2,
    title: "DocReady AI",
    body: "Know exactly which documents you are missing before you start any application.",
  },
  {
    icon: Megaphone,
    title: "Drishti Report",
    body: "Report public issues; AI classifies, routes and detects likely nearby duplicates.",
  },
  {
    icon: ShieldCheck,
    title: "Citizen Verification",
    body: "Was the issue actually resolved? Your confirmation matters — not just the authority’s.",
  },
];

const PROMPTS = [
  "My mother needs healthcare support.",
  "I need financial help for higher education.",
  "I want to start a small business.",
  "There is a dangerous pothole near my college.",
];

function LiveStats() {
  const [stats, setStats] = useState<{ total_schemes: number; total_categories: number; categories: { name: string; count: number }[] } | null>(null);

  useEffect(() => {
    statsService.getPublicStats().then(setStats).catch(() => null);
  }, []);

  if (!stats) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="p-5 text-center">
        <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Layers className="h-5 w-5" />
        </div>
        <div className="font-display text-3xl font-bold">{stats.total_schemes}</div>
        <div className="mt-1 text-xs text-muted-foreground">Government schemes indexed</div>
      </Card>
      <Card className="p-5 text-center">
        <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
          <LayoutGrid className="h-5 w-5" />
        </div>
        <div className="font-display text-3xl font-bold">{stats.total_categories}</div>
        <div className="mt-1 text-xs text-muted-foreground">Service categories covered</div>
      </Card>
      <Card className="p-5 text-center">
        <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
          <MessageSquareText className="h-5 w-5" />
        </div>
        <div className="font-display text-3xl font-bold">3</div>
        <div className="mt-1 text-xs text-muted-foreground">Languages supported</div>
      </Card>
      <Card className="p-5 text-center">
        <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="font-display text-3xl font-bold">24/7</div>
        <div className="mt-1 text-xs text-muted-foreground">Guidance availability</div>
      </Card>
    </div>
  );
}

function Landing() {
  const { t } = useI18n();

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 lg:px-8">
        <BrandMark />
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <Button variant="ghost" asChild>
            <Link to="/login">{t("cta.signIn")}</Link>
          </Button>
          <Button asChild>
            <Link to="/register">{t("cta.getStarted")}</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 gradient-hero opacity-[0.06]" aria-hidden />
          <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-card">
                  <Sparkle className="h-3.5 w-3.5 text-accent" /> Smart Bharat — AI-Powered Civic
                  Companion
                </div>
                <h1 className="font-display text-4xl font-bold tracking-tight text-balance lg:text-6xl">
                  AI that turns civic confusion into{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    action
                  </span>
                  .
                </h1>
                <p className="mt-5 max-w-xl text-base text-muted-foreground lg:text-lg">
                  Citizens describe what they need in everyday language. NagrikOS transforms that
                  confusion into relevant opportunities, document guidance, civic missions, and
                  trackable next actions.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button size="lg" asChild>
                    <Link to="/register">
                      {t("cta.getStarted")} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/login">{t("cta.signIn")}</Link>
                  </Button>
                </div>
              </div>

              <Card className="shadow-elevated">
                <div className="p-5">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Try AI Saathi
                  </div>
                  <div className="mt-3 rounded-xl border bg-background p-4">
                    <p className="text-sm text-muted-foreground">
                      Tell us what you need help with…
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {PROMPTS.map((p) => (
                        <Link
                          key={p}
                          to="/register"
                          className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-foreground/80 shadow-card transition hover:border-primary/50 hover:text-primary"
                        >
                          {p}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>English · हिन्दी · मराठी</span>
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Guidance only
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Live Stats */}
        <section className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
            <LiveStats />
          </div>
        </section>

        {/* Capabilities */}
        <section className="border-t bg-surface-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <h2 className="font-display text-3xl font-semibold">
                Not a chatbot. A civic action agent.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Six connected capabilities that move you from confusion to a clear next step.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((c) => {
                const Icon = c.icon;
                return (
                  <Card key={c.title} className="group p-5 transition hover:shadow-elevated">
                    <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="font-display text-lg font-semibold">{c.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Journey */}
        <section>
          <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
            <h2 className="font-display text-3xl font-semibold">One citizen journey</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Follow Aarav from a plain-language ask to a completed civic mission.
            </p>
            <ol className="mt-8 grid gap-4 md:grid-cols-4">
              {[
                { n: "01", h: "Ask", b: "“My mother is 62 and needs healthcare support.”" },
                {
                  n: "02",
                  h: "Understand",
                  b: "NagrikOS shows what it knows and what is missing.",
                },
                {
                  n: "03",
                  h: "Discover",
                  b: "PMJAY and Rashtriya Vayoshri appear as likely matches.",
                },
                { n: "04", h: "Act", b: "A Civic Mission is created with the next best action." },
              ].map((s) => (
                <li key={s.n} className="rounded-2xl border bg-card p-5 shadow-card">
                  <div className="font-display text-xs font-semibold text-accent">{s.n}</div>
                  <div className="mt-1 font-display text-lg font-semibold">{s.h}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.b}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Trust */}
        <section className="border-t bg-primary/5">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-3 lg:px-8">
            {[
              {
                h: "Grounded, transparent",
                b: "Every recommendation explains what matched, what is uncertain, and what is missing.",
              },
              {
                h: "Multilingual by design",
                b: "English, हिन्दी and मराठी across every screen — not just the marketing page.",
              },
              {
                h: "Guidance, not gate-keeping",
                b: "NagrikOS does not decide eligibility. Official sources always have the final say.",
              },
            ].map((x) => (
              <div key={x.h}>
                <div className="font-display text-lg font-semibold">{x.h}</div>
                <p className="mt-1 text-sm text-muted-foreground">{x.b}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl px-4 py-16 text-center lg:px-8">
            <h2 className="font-display text-3xl font-semibold text-balance">
              Confusion into clarity. Clarity into action.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Create your NagrikOS space in under a minute.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/register">{t("cta.getStarted")}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">{t("cta.signIn")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-8 text-xs text-muted-foreground sm:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <BrandMark size={26} />
          </div>
          <div>Prototype for hackathon demonstration. Not an official government portal.</div>
        </div>
      </footer>
    </div>
  );
}
