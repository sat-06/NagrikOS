import { type ReactNode, useEffect } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/auth-context";
import { useI18n } from "@/i18n/i18n-context";
import { BrandMark } from "./brand-mark";
import { LanguageSwitcher } from "./language-switcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  MessageSquareText,
  Radar,
  Target,
  FileCheck2,
  Megaphone,
  Inbox,
  UserCircle2,
  LogOut,
} from "lucide-react";

interface NavItem {
  to: string;
  icon: typeof Home;
  labelKey: string;
}

const NAV: NavItem[] = [
  { to: "/dashboard", icon: Home, labelKey: "nav.home" },
  { to: "/ai-saathi", icon: MessageSquareText, labelKey: "nav.aiSaathi" },
  { to: "/opportunities", icon: Radar, labelKey: "nav.opportunities" },
  { to: "/missions", icon: Target, labelKey: "nav.missions" },
  { to: "/docready", icon: FileCheck2, labelKey: "nav.docready" },
  { to: "/report-issue", icon: Megaphone, labelKey: "nav.report" },
  { to: "/complaints", icon: Inbox, labelKey: "nav.complaints" },
  { to: "/profile", icon: UserCircle2, labelKey: "nav.profile" },
];

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [loading, isAuthenticated, navigate]);

  if (loading || !isAuthenticated) {
    return (
      <div className="grid min-h-dvh place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <div className="p-5">
          <Link to="/dashboard">
            <BrandMark />
          </Link>
        </div>
        <nav aria-label="Primary" className="flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const active =
              pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <div className="mb-3 text-xs text-muted-foreground">Signed in as</div>
          <div className="mb-3 truncate text-sm font-medium">{user?.fullName}</div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={async () => {
              await logout();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> {t("cta.signOut")}
          </Button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <Link to="/dashboard">
              <BrandMark size={28} />
            </Link>
          </div>
          <h1 className="hidden truncate font-display text-lg font-semibold lg:block">{title}</h1>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-10">
          {title && (
            <h1 className="mb-6 font-display text-2xl font-semibold tracking-tight lg:hidden">
              {title}
            </h1>
          )}
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav
          aria-label="Primary mobile"
          className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t bg-background/95 py-2 backdrop-blur lg:hidden"
        >
          {NAV.slice(0, 5).map((item) => {
            const active =
              pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-w-[56px] flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
