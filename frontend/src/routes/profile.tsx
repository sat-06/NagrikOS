import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { profileService } from "@/lib/api/services";
import type { CitizenProfile, Language } from "@/types";
import { useI18n } from "@/i18n/i18n-context";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — NagrikOS" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t, setLang } = useI18n();
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileService.getProfile().then(setProfile);
  }, []);

  async function save() {
    if (!profile) return;
    setSaving(true);
    const p = await profileService.saveProfile(profile);
    setProfile(p);
    setLang(p.preferredLanguage);
    setSaving(false);
    toast.success("Profile saved");
  }

  if (!profile)
    return (
      <AppShell title={t("nav.profile")}>
        <Card className="h-64 animate-pulse bg-muted/40" />
      </AppShell>
    );

  return (
    <AppShell title={t("nav.profile")}>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold">Personal details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <F label="Full name">
              <Input
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              />
            </F>
            <F label="Preferred language">
              <Select
                value={profile.preferredLanguage}
                onValueChange={(v) => setProfile({ ...profile, preferredLanguage: v as Language })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                  <SelectItem value="mr">मराठी</SelectItem>
                </SelectContent>
              </Select>
            </F>
            <F label="State">
              <Input
                value={profile.state ?? ""}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              />
            </F>
            <F label="District">
              <Input
                value={profile.district ?? ""}
                onChange={(e) => setProfile({ ...profile, district: e.target.value })}
              />
            </F>
            <F label="Age">
              <Input
                type="number"
                value={profile.age ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    age: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </F>
            <F label="Occupation">
              <Input
                value={profile.occupation ?? ""}
                onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
              />
            </F>
            <F label="Income band">
              <Select
                value={profile.incomeBand ?? ""}
                onValueChange={(v) =>
                  setProfile({ ...profile, incomeBand: v as CitizenProfile["incomeBand"] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="below_1L">Below ₹1L</SelectItem>
                  <SelectItem value="1L_3L">₹1L – ₹3L</SelectItem>
                  <SelectItem value="3L_6L">₹3L – ₹6L</SelectItem>
                  <SelectItem value="6L_12L">₹6L – ₹12L</SelectItem>
                  <SelectItem value="above_12L">Above ₹12L</SelectItem>
                </SelectContent>
              </Select>
            </F>
          </div>
          <div className="mt-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={!!profile.isStudent}
                onCheckedChange={(v) => setProfile({ ...profile, isStudent: !!v })}
              />{" "}
              Student
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={!!profile.isFarmer}
                onCheckedChange={(v) => setProfile({ ...profile, isFarmer: !!v })}
              />{" "}
              Farmer
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save changes
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Profile completeness
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold">{profile.completeness}%</span>
              <span className="text-sm text-muted-foreground">of your profile is filled</span>
            </div>
            <Progress value={profile.completeness} className="mt-2 h-2" />
            <div className="mt-3 text-xs text-muted-foreground">
              More details = sharper opportunity matches.
            </div>
          </Card>
          <Card className="p-5 text-xs text-muted-foreground">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5" /> This is a frontend demo. In
            production, your data would sync with your NagrikOS account securely.
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
