import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const LANGS = {
  en: "English",
  es: "Español",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  zh: "中文",
  ja: "日本語",
  ar: "العربية",
} as const;

export type Lang = keyof typeof LANGS;

const COUNTRY_LANG: Record<string, Lang> = {
  US: "en", GB: "en", CA: "en", AU: "en", NZ: "en", IE: "en",
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es", CR: "es", GT: "es", DO: "es", EC: "es", BO: "es", UY: "es", PY: "es", PA: "es", HN: "es", SV: "es", NI: "es", CU: "es",
  BR: "pt", PT: "pt",
  FR: "fr", BE: "fr", LU: "fr", MC: "fr",
  DE: "de", AT: "de", CH: "de",
  IT: "it", SM: "it", VA: "it",
  CN: "zh", TW: "zh", HK: "zh", SG: "zh",
  JP: "ja",
  SA: "ar", AE: "ar", EG: "ar", MA: "ar", DZ: "ar", TN: "ar", JO: "ar", LB: "ar", QA: "ar", KW: "ar", OM: "ar", BH: "ar", IQ: "ar", LY: "ar", YE: "ar", SY: "ar",
};

const STORAGE_KEY = "nuva.lang";
const COOKIE = "googtrans";

function setGoogTransCookie(lang: Lang) {
  if (typeof document === "undefined") return;
  const value = lang === "en" ? "" : `/en/${lang}`;
  // Set for current host + parent domain so Google Translate picks it up.
  const host = window.location.hostname;
  const domains = [host, "." + host, "." + host.split(".").slice(-2).join(".")];
  const expire = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  for (const d of domains) {
    document.cookie = `${COOKIE}=${value}; path=/; domain=${d}; expires=${expire}`;
  }
  document.cookie = `${COOKIE}=${value}; path=/; expires=${expire}`;
  if (!value) {
    // Clear cookie to return to English
    for (const d of domains) {
      document.cookie = `${COOKIE}=; path=/; domain=${d}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
    document.cookie = `${COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

function readCookieLang(): Lang | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )googtrans=([^;]+)/);
  if (!m) return null;
  const parts = decodeURIComponent(m[1]).split("/");
  const code = parts[2] as Lang | undefined;
  return code && code in LANGS ? code : null;
}

type I18nCtx = { lang: Lang; setLang: (l: Lang) => void };
const Ctx = createContext<I18nCtx>({ lang: "en", setLang: () => {} });

// Injects Google Translate script + hidden mount point.
function injectGoogleTranslate() {
  if (typeof window === "undefined") return;
  if ((window as any).__nuvaGT) return;
  (window as any).__nuvaGT = true;

  (window as any).googleTranslateElementInit = () => {
    // @ts-expect-error - external global from Google Translate script
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: Object.keys(LANGS).filter((l) => l !== "en").join(","),
        autoDisplay: false,
        // @ts-expect-error - external global from Google Translate script
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      "google_translate_element",
    );
  };

  const s = document.createElement("script");
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.async = true;
  document.body.appendChild(s);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    injectGoogleTranslate();

    const cookieLang = readCookieLang();
    const stored = (localStorage.getItem(STORAGE_KEY) as Lang | null) ?? cookieLang;

    if (stored && stored in LANGS) {
      setLangState(stored);
      setGoogTransCookie(stored);
      return;
    }

    // Auto-detect from IP once
    let cancelled = false;
    fetch("https://ipapi.co/json/")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        const code = data?.country_code as string | undefined;
        const mapped = code ? COUNTRY_LANG[code] : undefined;
        if (mapped && mapped !== "en" && !localStorage.getItem(STORAGE_KEY)) {
          localStorage.setItem(STORAGE_KEY, mapped);
          setGoogTransCookie(mapped);
          setLangState(mapped);
          // Reload so Google Translate applies to already-rendered DOM
          window.location.reload();
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const setLang = (l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setGoogTransCookie(l);
    setLangState(l);
    // Reload so the widget re-applies fresh translations to the whole page.
    window.location.reload();
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang]);

  const value = useMemo<I18nCtx>(() => ({ lang, setLang }), [lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}
