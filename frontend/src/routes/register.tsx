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

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [{ title: "Create account — NagrikOS" }],
  }),
  component: Register,
});

function Register() {
  const { register } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password.length < 6) {
      toast.error(t("register.validation.passwordLength"));
      return;
    }

    setSubmitting(true);

    try {
      await register(fullName, email, password);
      toast.success(t("register.toast.success"));
      navigate({ to: "/onboarding" });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("register.toast.error"),
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
              {t("register.title")}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {t("register.subtitle")}
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="fullName">
                {t("register.fullName.label")}
              </Label>

              <Input
                id="fullName"
                autoComplete="name"
                placeholder={t("register.fullName.placeholder")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                {t("register.email.label")}
              </Label>

              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("register.email.placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {t("register.password.label")}
              </Label>

              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder={t("register.password.placeholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <p className="text-xs text-muted-foreground">
                {t("register.password.help")}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting
                ? t("register.submitting")
                : t("register.submit")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("register.haveAccount")}{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              {t("cta.signIn")}
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}