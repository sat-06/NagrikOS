import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/i18n/i18n-context";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in — NagrikOS" }],
  }),
  component: Login,
});

function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [email, setEmail] = useState("aarav@example.com");
  const [password, setPassword] = useState("password123");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await login(email, password);
      toast.success(t("login.toast.success"));
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("login.toast.error"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 lg:px-8">
        <Link to="/">
          <BrandMark />
        </Link>

        <LanguageSwitcher />
      </header>

      <main className="mx-auto grid max-w-6xl place-items-center px-4 py-10 lg:px-8 lg:py-16">
        <Card className="w-full max-w-md p-6 shadow-elevated sm:p-8">
          <div>
            <h1 className="font-display text-2xl font-semibold">
              {t("login.title")}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {t("login.subtitle")}
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email.label")}</Label>

              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("login.email.placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {t("login.password.label")}
              </Label>

              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder={t("login.password.placeholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting
                ? t("login.submitting")
                : t("cta.signIn")}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground">
            {t("login.demoHint")}
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("login.noAccount")}{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              {t("login.createAccount")}
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}