import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { documentService, servicesService } from "@/lib/api/services";
import type { DocumentReadiness, ServiceScheme } from "@/types";
import { useI18n } from "@/i18n/i18n-context";
import {
  Upload,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";

interface Search {
  svc?: string;
}

export const Route = createFileRoute("/docready")({
  head: () => ({ meta: [{ title: "DocReady AI — NagrikOS" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    svc: typeof s.svc === "string" ? s.svc : undefined,
  }),
  component: DocReadyPage,
});

function DocReadyPage() {
  const { t } = useI18n();
  const initial = Route.useSearch();
  const [services, setServices] = useState<ServiceScheme[]>([]);
  const [selected, setSelected] = useState<string>(initial.svc ?? "");
  const [readiness, setReadiness] = useState<DocumentReadiness | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    servicesService.list().then(setServices);
  }, []);
  useEffect(() => {
    if (!selected) return;
    const svc = services.find((s) => s.id === selected);
    if (!svc) return;
    setLoading(true);
    documentService.checkReadiness(svc.name, svc.requiredDocuments).then((r) => {
      setReadiness(r);
      setLoading(false);
    });
  }, [selected, services]);

  async function onFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    await documentService.uploadDocument(files[0]);
    setUploading(false);
    toast.success(`Uploaded ${files[0].name}`);
  }

  return (
    <AppShell title={t("docready.title")}>
      <p className="mb-6 text-muted-foreground">{t("docready.subtitle")}</p>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Select context
          </div>
          <div className="mt-2">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a service or mission" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onFiles(e.dataTransfer.files);
            }}
            className={`mt-5 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition ${dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/40"}`}
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-background text-primary">
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Upload className="h-6 w-6" />
              )}
            </div>
            <div className="font-medium">Drag & drop documents here</div>
            <div className="text-xs text-muted-foreground">PDF, JPG or PNG. Up to 5 MB each.</div>
            <input ref={inputRef} type="file" hidden onChange={(e) => onFiles(e.target.files)} />
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => inputRef.current?.click()}
            >
              Browse files
            </Button>
          </div>

          <div className="mt-4 rounded-lg border border-muted-foreground/20 bg-muted/40 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5" /> Prototype readiness guidance only.
            Documents are not officially verified.
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Readiness</div>
          {!selected && (
            <div className="mt-4 text-sm text-muted-foreground">
              Choose a service to see readiness.
            </div>
          )}
          {selected && loading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking…
            </div>
          )}
          {selected && !loading && readiness && (
            <>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl font-semibold">
                  {readiness.readinessPercent}%
                </span>
                <span className="text-sm text-muted-foreground">{t("docready.ready")}</span>
              </div>
              <Progress value={readiness.readinessPercent} className="mt-2 h-2" />

              <ReadinessList
                tone="success"
                icon={<CheckCircle2 className="h-4 w-4 text-success" />}
                label={t("docready.available")}
                items={readiness.available.map((d) => d.name)}
              />
              <ReadinessList
                tone="warning"
                icon={<AlertTriangle className="h-4 w-4 text-warning" />}
                label={t("docready.missing")}
                items={readiness.missing.map((d) => d.name)}
              />
              <ReadinessList
                tone="info"
                icon={<HelpCircle className="h-4 w-4 text-info" />}
                label={t("docready.uncertain")}
                items={readiness.uncertain.map((d) => d.name)}
              />

              {readiness.nextActions.length > 0 && (
                <div className="mt-4 border-t pt-3 text-sm">
                  <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Next
                  </div>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    {readiness.nextActions.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          {selected && !loading && !readiness && (
            <div className="mt-4 flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <FileCheck2 className="h-6 w-6" /> No requirements found for this service.
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function ReadinessList({
  tone,
  icon,
  label,
  items,
}: {
  tone: "success" | "warning" | "info";
  icon: React.ReactNode;
  label: string;
  items: string[];
}) {
  if (!items.length) return null;
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((i) => (
          <StatusBadge key={i} tone={tone}>
            {i}
          </StatusBadge>
        ))}
      </div>
    </div>
  );
}
