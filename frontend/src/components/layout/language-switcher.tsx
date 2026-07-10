import { useI18n } from "@/i18n/i18n-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <Languages
        className="h-4 w-4 text-muted-foreground"
        aria-hidden
      />

      <Select
        value={lang}
        onValueChange={(value) =>
          setLang(value as "en" | "hi" | "mr")
        }
      >
        <SelectTrigger
          className="h-9 w-[130px]"
          aria-label={t("common.language")}
        >
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="en">
            {t("language.english")}
          </SelectItem>

          <SelectItem value="hi">
            {t("language.hindi")}
          </SelectItem>

          <SelectItem value="mr">
            {t("language.marathi")}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}