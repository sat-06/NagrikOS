import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — NagrikOS" },
      { name: "description", content: "Sign in to your NagrikOS civic action space." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@nagrikos.in");
  const [password, setPassword] = useState("Demo@12345");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@") || password.length < 6) {
      setError("Please enter a valid email and a password of at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back to NagrikOS");
      navigate({ to: "/dashboard" });
    } catch {
      setError("Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden gradient-hero lg:block">
        <div className="absolute inset-0 p-10 text-primary-foreground">
          <BrandMark className="[&_div]:text-primary-foreground" />
          <div className="mt-24 max-w-md">
            <h2 className="font-display text-4xl font-semibold leading-tight">
              Confusion into clarity. Clarity into action.
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Sign in to continue your civic missions, follow up on complaints, and get personalised
              opportunity matches.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background px-4 py-10">
        <Card className="w-full max-w-md p-6 shadow-card">
          <Link to="/" className="lg:hidden">
            <BrandMark />
          </Link>
          <h1 className="mt-4 font-display text-2xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the demo credentials or your own values — this is a frontend demo.
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign in
            </Button>
          </form>

          <div className="mt-4 flex justify-between text-sm">
            <Link to="/register" className="text-primary hover:underline">
              Create account
            </Link>
            <span className="text-muted-foreground">Forgot password? (demo)</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
