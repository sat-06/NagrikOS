import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { profileService } from "@/lib/api/services";
import { useI18n } from "@/i18n/i18n-context";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [{ title: "Set up your profile — NagrikOS" }],
  }),
  component: Onboarding,
});

const INTEREST_KEYS = [
  "onboarding.interest.healthcare",
  "onboarding.interest.education",
  "onboarding.interest.business",
  "onboarding.interest.housing",
  "onboarding.interest.agriculture",
  "onboarding.interest.employment",
];

function Onboarding() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [age, setAge] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [district, setDistrict] = useState("Pune");
  const [education, setEducation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [incomeBand, setIncomeBand] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  function toggleInterest(value: string) {
    setInterests((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function finish() {
    setSaving(true);

    try {
      await profileService.updateProfile({
        age: age ? Number(age) : undefined,
        state,
        district,
        education: education || undefined,
        occupation: occupation || undefined,
        incomeBand: incomeBand || undefined,
        interests,
      });

      toast.success(t("onboarding.toast.success"));
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("onboarding.toast.error"),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell title={t("onboarding.pageTitle")}>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t("onboarding.step")} {step} {t("onboarding.of")} {totalSteps}
            </span>

            <span>{Math.round(progress)}%</span>
          </div>

          <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-6 shadow-card sm:p-8">
          {step === 1 && (
            <section>
              <h2 className="font-display text-2xl font-semibold">
                {t("onboarding.basic.title")}
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {t("onboarding.basic.subtitle")}
              </p>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="age">
                    {t("onboarding.age.label")}
                  </Label>

                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    placeholder={t("onboarding.age.placeholder")}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">
                    {t("onboarding.state.label")}
                  </Label>

                  <Input
                    id="state"
                    placeholder={t("onboarding.state.placeholder")}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">
                    {t("onboarding.district.label")}
                  </Label>

                  <Input
                    id="district"
                    placeholder={t("onboarding.district.placeholder")}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h2 className="font-display text-2xl font-semibold">
                {t("onboarding.background.title")}
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {t("onboarding.background.subtitle")}
              </p>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>{t("onboarding.education.label")}</Label>

                  <Select value={education} onValueChange={setEducation}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          "onboarding.education.placeholder",
                        )}
                      />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="school">
                        {t("onboarding.education.school")}
                      </SelectItem>

                      <SelectItem value="higher_secondary">
                        {t("onboarding.education.higherSecondary")}
                      </SelectItem>

                      <SelectItem value="undergraduate">
                        {t("onboarding.education.undergraduate")}
                      </SelectItem>

                      <SelectItem value="postgraduate">
                        {t("onboarding.education.postgraduate")}
                      </SelectItem>

                      <SelectItem value="other">
                        {t("onboarding.option.other")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("onboarding.occupation.label")}</Label>

                  <Select value={occupation} onValueChange={setOccupation}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          "onboarding.occupation.placeholder",
                        )}
                      />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="student">
                        {t("onboarding.occupation.student")}
                      </SelectItem>

                      <SelectItem value="employed">
                        {t("onboarding.occupation.employed")}
                      </SelectItem>

                      <SelectItem value="self_employed">
                        {t("onboarding.occupation.selfEmployed")}
                      </SelectItem>

                      <SelectItem value="unemployed">
                        {t("onboarding.occupation.unemployed")}
                      </SelectItem>

                      <SelectItem value="retired">
                        {t("onboarding.occupation.retired")}
                      </SelectItem>

                      <SelectItem value="other">
                        {t("onboarding.option.other")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("onboarding.income.label")}</Label>

                  <Select value={incomeBand} onValueChange={setIncomeBand}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("onboarding.income.placeholder")}
                      />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="below_1l">
                        {t("onboarding.income.below1l")}
                      </SelectItem>

                      <SelectItem value="1l_3l">
                        {t("onboarding.income.1l3l")}
                      </SelectItem>

                      <SelectItem value="3l_5l">
                        {t("onboarding.income.3l5l")}
                      </SelectItem>

                      <SelectItem value="5l_10l">
                        {t("onboarding.income.5l10l")}
                      </SelectItem>

                      <SelectItem value="above_10l">
                        {t("onboarding.income.above10l")}
                      </SelectItem>

                      <SelectItem value="prefer_not">
                        {t("onboarding.income.preferNot")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <h2 className="font-display text-2xl font-semibold">
                {t("onboarding.interests.title")}
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {t("onboarding.interests.subtitle")}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {INTEREST_KEYS.map((key) => {
                  const selected = interests.includes(key);

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleInterest(key)}
                      className={
                        selected
                          ? "rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                          : "rounded-full border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/50"
                      }
                    >
                      {t(key)}
                    </button>
                  );
                })}
              </div>

              <p className="mt-5 text-xs text-muted-foreground">
                {t("onboarding.interests.help")}
              </p>
            </section>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={step === 1}
              onClick={() => setStep((current) => Math.max(1, current - 1))}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t("cta.back")}
            </Button>

            {step < totalSteps ? (
              <Button
                type="button"
                onClick={() =>
                  setStep((current) => Math.min(totalSteps, current + 1))
                }
              >
                {t("cta.continue")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={finish}
                disabled={saving}
              >
                {saving
                  ? t("onboarding.saving")
                  : t("onboarding.finish")}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}