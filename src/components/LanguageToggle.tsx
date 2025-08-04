import { Button } from "@/components/ui/button";
import { useLanguage, SupportedLanguage } from "@/contexts/LanguageContext";

const langs: { code: SupportedLanguage; label: string }[] = [
  { code: "th", label: "TH" },
  { code: "en", label: "EN" },
];

export const LanguageToggle = () => {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex gap-1">
      {langs.map(({ code, label }) => (
        <Button
          key={code}
          size="sm"
          variant={lang === code ? "default" : "outline"}
          onClick={() => setLang(code)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
};
