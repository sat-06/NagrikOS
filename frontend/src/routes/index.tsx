import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/layout/brand-mark";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n/i18n-context";
import {
  MessageSquareText,
  Radar,
  Target,
  FileCheck2,
  Megaphone,
  ShieldCheck,
  ArrowRight,
  Sparkle,
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
    titleKey: "landing.capabilities.aiSaathi.title",
    bodyKey: "landing.capabilities.aiSaathi.body",
  },
  {
    icon: Radar,
    titleKey: "landing.capabilities.radar.title",
    bodyKey: "landing.capabilities.radar.body",
  },
  {
    icon: Target,
    titleKey: "landing.capabilities.missions.title",
    bodyKey: "landing.capabilities.missions.body",
  },
  {
    icon: FileCheck2,
    titleKey: "landing.capabilities.docready.title",
    bodyKey: "landing.capabilities.docready.body",
  },
  {
    icon: Megaphone,
    titleKey: "landing.capabilities.drishti.title",
    bodyKey: "landing.capabilities.drishti.body",
  },
  {
    icon: ShieldCheck,
    titleKey: "landing.capabilities.verification.title",
    bodyKey: "landing.capabilities.verification.body",
  },
];

const PROMPTS = [
  "landing.prompt.healthcare",
  "landing.prompt.education",
  "landing.prompt.business",
  "landing.prompt.pothole",
];

const JOURNEY_STEPS = [
  {
    n: "01",
    titleKey: "landing.journey.ask.title",
    bodyKey: "landing.journey.ask.body",
  },
  {
    n: "02",
    titleKey: "landing.journey.understand.title",
    bodyKey: "landing.journey.understand.body",
  },
  {
    n: "03",
    titleKey: "landing.journey.discover.title",
    bodyKey: "landing.journey.discover.body",
  },
  {
    n: "04",
    titleKey: "landing.journey.act.title",
    bodyKey: "landing.journey.act.body",
  },
];

const TRUST_ITEMS = [
  {
    titleKey: "landing.trust.transparent.title",
    bodyKey: "landing.trust.transparent.body",
  },
  {
    titleKey: "landing.trust.multilingual.title",
    bodyKey: "landing.trust.multilingual.body",
  },
  {
    titleKey: "landing.trust.guidance.title",
    bodyKey: "landing.trust.guidance.body",
  },
];

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
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 -z-10 gradient-hero opacity-[0.06]"
            aria-hidden
          />

          <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-card">
                  <Sparkle className="h-3.5 w-3.5 text-accent" />
                  {t("landing.badge")}
                </div>

                <h1 className="font-display text-4xl font-bold tracking-tight text-balance lg:text-6xl">
                  {t("landing.hero.prefix")}{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {t("landing.hero.action")}
                  </span>
                  .
                </h1>

                <p className="mt-5 max-w-xl text-base text-muted-foreground lg:text-lg">
                  {t("landing.hero.description")}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button size="lg" asChild>
                    <Link to="/register">
                      {t("cta.getStarted")}
                      <ArrowRight className="ml-1 h-4 w-4" />
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
                    {t("landing.tryAiSaathi")}
                  </div>

                  <div className="mt-3 rounded-xl border bg-background p-4">
                    <p className="text-sm text-muted-foreground">
                      {t("landing.tellUs")}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {PROMPTS.map((key) => (
                        <Link
                          key={key}
                          to="/register"
                          className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-foreground/80 shadow-card transition hover:border-primary/50 hover:text-primary"
                        >
                          {t(key)}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("landing.languages")}</span>

                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {t("landing.guidanceOnly")}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-t bg-surface-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <h2 className="font-display text-3xl font-semibold">
                {t("landing.capabilities.title")}
              </h2>

              <p className="mt-3 text-muted-foreground">
                {t("landing.capabilities.subtitle")}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((capability) => {
                const Icon = capability.icon;

                return (
                  <Card
                    key={capability.titleKey}
                    className="group p-5 transition hover:shadow-elevated"
                  >
                    <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="font-display text-lg font-semibold">
                      {t(capability.titleKey)}
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {t(capability.bodyKey)}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
            <h2 className="font-display text-3xl font-semibold">
              {t("landing.journey.title")}
            </h2>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              {t("landing.journey.subtitle")}
            </p>

            <ol className="mt-8 grid gap-4 md:grid-cols-4">
              {JOURNEY_STEPS.map((step) => (
                <li
                  key={step.n}
                  className="rounded-2xl border bg-card p-5 shadow-card"
                >
                  <div className="font-display text-xs font-semibold text-accent">
                    {step.n}
                  </div>

                  <div className="mt-1 font-display text-lg font-semibold">
                    {t(step.titleKey)}
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(step.bodyKey)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t bg-primary/5">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-3 lg:px-8">
            {TRUST_ITEMS.map((item) => (
              <div key={item.titleKey}>
                <div className="font-display text-lg font-semibold">
                  {t(item.titleKey)}
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t(item.bodyKey)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl px-4 py-16 text-center lg:px-8">
            <h2 className="font-display text-3xl font-semibold text-balance">
              {t("landing.finalCta.title")}
            </h2>

            <p className="mt-3 text-muted-foreground">
              {t("landing.finalCta.subtitle")}
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

          <div>{t("landing.footer.prototype")}</div>
        </div>
      </footer>
    </div>
  );
}