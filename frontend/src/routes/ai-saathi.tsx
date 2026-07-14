import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { chatService, missionService } from "@/lib/api/services";
import type { ChatMessage, ChatSession } from "@/types";
import { useI18n } from "@/i18n/i18n-context";
import {
  MessageSquareText,
  Plus,
  Send,
  Sparkles,
  ExternalLink,
  Target,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Search {
  q?: string;
}

export const Route = createFileRoute("/ai-saathi")({
  head: () => ({ meta: [{ title: "AI Saathi — NagrikOS" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  component: AiSaathi,
});

const EXAMPLES = [
  "My widowed mother needs healthcare support.",
  "I lost my job and need guidance.",
  "Mala scholarship sathi madat havi aahe.",
  "Streetlight in my lane has been broken for a week.",
];

function AiSaathi() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatService.listSessions().then((s) => {
      setSessions(s);
      setActiveId(s[0]?.id ?? null);
    });
  }, []);
  useEffect(() => {
    if (search.q && activeId === null) return;
    if (search.q) send(search.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.q, activeId]);
  const active = sessions.find((s) => s.id === activeId) ?? null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length]);

  async function newConversation() {
    const s = await chatService.createSession("");
    setSessions((prev) => [s, ...prev]);
    setActiveId(s.id);
  }

  async function send(content: string) {
    if (!content.trim()) return;
    let sessionId = activeId;
    if (!sessionId) {
      const s = await chatService.createSession(content.slice(0, 40));
      sessionId = s.id;
      setActiveId(s.id);
    }
    setInput("");
    setSending(true);
    // optimistically show user message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: [
                ...s.messages,
                {
                  id: `tmp-${Date.now()}`,
                  role: "user",
                  content,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : s,
      ),
    );
    try {
      const response = await chatService.sendMessage(sessionId, content);
      // Update sessions with returned data
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          const userMsg: ChatMessage = {
            id: String(response.user_message.id),
            role: "user",
            content: response.user_message.content,
            createdAt: response.user_message.created_at,
          };
          const assistantMsg: ChatMessage = {
            id: String(response.assistant_message.id),
            role: "assistant",
            content: response.assistant_message.content,
            createdAt: response.assistant_message.created_at,
          };
          if (response.metadata) {
            const meta = response.metadata;
            if (meta.life_situation || meta.intent) {
              assistantMsg.understoodSituation = {
                primaryNeed: meta.intent ?? undefined,
                personContext: (meta.life_situation as Record<string, unknown>)?.person_context as string | undefined,
                known: {},
                missing: ((meta.life_situation as Record<string, unknown>)?.missing_information as string[] ?? []).map(
                  (v: string) => v.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
                ),
                categories: meta.intent ? [meta.intent.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())] : [],
              };
            }
            if (meta.suggested_actions?.length) {
              assistantMsg.suggestedActions = meta.suggested_actions.map((a: string) => ({ title: a, description: "" }));
            }
            if (meta.related_services?.length) {
              assistantMsg.relatedServices = meta.related_services.map((s: Record<string, unknown>) => ({
                id: String(s.id ?? s.name ?? "service"),
                name: (s.name as string) ?? "Related service",
                category: "welfare" as const,
                shortDescription: "",
                simplifiedDescription: "",
                targetGroups: [],
                benefits: [],
                requiredDocuments: [],
                applicationSteps: [],
                stateApplicability: [],
                sourceName: "",
                sourceUrl: "#",
                lastReviewed: "—",
              }));
            }
            if (meta.uncertainty_notes?.length) {
              assistantMsg.uncertainty = meta.uncertainty_notes.join(" ");
            }
            if (meta.disclaimer) {
              assistantMsg.disclaimer = meta.disclaimer;
            }
          }
          const filtered = s.messages.filter((m) => !String(m.id).startsWith("tmp-"));
          return {
            ...s,
            title: s.title === "New conversation" ? content.slice(0, 80) : s.title,
            messages: [...filtered, userMsg, assistantMsg],
          };
        }),
      );
    } catch {
      const list = await chatService.listSessions();
      setSessions(list);
    }
    setSending(false);
  }

  return (
    <AppShell title={t("nav.aiSaathi")}>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Sessions */}
        <Card className="hidden max-h-[calc(100dvh-140px)] flex-col p-3 lg:flex">
          <Button onClick={newConversation} className="w-full justify-start">
            <Plus className="mr-2 h-4 w-4" /> {t("chat.newConversation")}
          </Button>
          <div className="mt-3 flex-1 space-y-1 overflow-y-auto pr-1">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${activeId === s.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              >
                <div className="truncate font-medium">{s.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(s.updatedAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Chat */}
        <Card className="flex max-h-[calc(100dvh-140px)] flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6">
            {!active || active.messages.length === 0 ? (
              <div className="grid h-full place-items-center py-12 text-center">
                <div>
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl gradient-hero text-primary-foreground">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h2 className="font-display text-xl font-semibold">
                    Describe what you need help with
                  </h2>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    AI Saathi will explain what it understood, suggest actions, and link real
                    services.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {EXAMPLES.map((e) => (
                      <button
                        key={e}
                        onClick={() => send(e)}
                        className="rounded-full border bg-background px-3 py-1 text-xs text-foreground/80 hover:border-primary/40 hover:text-primary"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {active.messages.map((m) => (
                  <MessageView key={m.id} msg={m} />
                ))}
                {sending && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> {t("chat.thinking")}
                  </div>
                )}
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2 border-t bg-background/60 p-3 lg:p-4"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={t("chat.placeholder")}
              aria-label="Message"
              className="flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <Button type="submit" disabled={sending || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

function MessageView({ msg }: { msg: ChatMessage }) {
  const { t } = useI18n();
  const nav = useNavigate();
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground shadow-card">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl gradient-hero text-primary-foreground">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <p className="text-sm leading-relaxed text-foreground">{msg.content}</p>

        {msg.understoodSituation && (
          <div className="rounded-xl border bg-surface-muted/60 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("chat.understood")}
            </div>
            <dl className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
              {msg.understoodSituation.primaryNeed && (
                <Kv label="Primary need" value={msg.understoodSituation.primaryNeed} />
              )}
              {msg.understoodSituation.personContext && (
                <Kv label="Person context" value={msg.understoodSituation.personContext} />
              )}
              {Object.entries(msg.understoodSituation.known).map(([k, v]) => (
                <Kv key={k} label={`Known · ${k}`} value={v} />
              ))}
            </dl>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {msg.understoodSituation.categories.map((c) => (
                <StatusBadge key={c} tone="info">
                  {c}
                </StatusBadge>
              ))}
              {msg.understoodSituation.missing.map((c) => (
                <StatusBadge key={c} tone="warning">
                  Missing: {c}
                </StatusBadge>
              ))}
            </div>
          </div>
        )}

        {msg.suggestedActions && (
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("chat.actions")}
            </div>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {msg.suggestedActions.map((a) => (
                <li key={a.title} className="rounded-xl border bg-card p-3">
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{a.description}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {msg.relatedServices && msg.relatedServices.length > 0 && (
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("chat.related")}
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {msg.relatedServices.map((s) => (
                <div key={s.id} className="rounded-xl border p-3 text-sm">
                  <div className="font-medium">{s.name}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {s.simplifiedDescription}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {msg.sources && msg.sources.length > 0 && (
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("chat.sources")}
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {msg.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {s.title} <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {msg.uncertainty && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs">
            <span className="font-medium">{t("chat.uncertainty")}: </span>
            {msg.uncertainty}
          </div>
        )}
        {msg.disclaimer && <div className="text-xs text-muted-foreground">{msg.disclaimer}</div>}

        {msg.relatedServices && msg.relatedServices.length > 0 && (
          <div className="pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  const m = await missionService.createFromService(msg.relatedServices![0].id);
                  toast.success("Mission created from this conversation.");
                  nav({ to: "/missions/$id", params: { id: m.id } });
                } catch {
                  toast.error("Could not create a mission from this conversation.");
                }
              }}
            >
              <Target className="mr-1.5 h-3.5 w-3.5" /> {t("chat.turnIntoMission")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-dashed py-1 last:border-none">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
