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

type Dict = Record<string, string>;

const DICTS: Record<Lang, Dict> = {
  en: { home: "Home", browse: "Browse Providers", pricing: "Pricing", safety: "Safety", faq: "FAQ", login: "Log in", dashboard: "Dashboard", book: "Book Now", language: "Language" },
  es: { home: "Inicio", browse: "Ver Proveedores", pricing: "Precios", safety: "Seguridad", faq: "Preguntas", login: "Ingresar", dashboard: "Panel", book: "Reservar", language: "Idioma" },
  pt: { home: "Início", browse: "Ver Prestadores", pricing: "Preços", safety: "Segurança", faq: "Perguntas", login: "Entrar", dashboard: "Painel", book: "Reservar", language: "Idioma" },
  fr: { home: "Accueil", browse: "Voir Prestataires", pricing: "Tarifs", safety: "Sécurité", faq: "FAQ", login: "Connexion", dashboard: "Tableau", book: "Réserver", language: "Langue" },
  de: { home: "Startseite", browse: "Anbieter", pricing: "Preise", safety: "Sicherheit", faq: "FAQ", login: "Anmelden", dashboard: "Dashboard", book: "Buchen", language: "Sprache" },
  it: { home: "Home", browse: "Fornitori", pricing: "Prezzi", safety: "Sicurezza", faq: "FAQ", login: "Accedi", dashboard: "Pannello", book: "Prenota", language: "Lingua" },
  zh: { home: "首页", browse: "浏览服务者", pricing: "价格", safety: "安全", faq: "常见问题", login: "登录", dashboard: "控制台", book: "立即预订", language: "语言" },
  ja: { home: "ホーム", browse: "プロバイダー", pricing: "料金", safety: "安全", faq: "FAQ", login: "ログイン", dashboard: "ダッシュボード", book: "予約する", language: "言語" },
  ar: { home: "الرئيسية", browse: "المزودون", pricing: "الأسعار", safety: "الأمان", faq: "الأسئلة", login: "تسجيل الدخول", dashboard: "لوحة التحكم", book: "احجز الآن", language: "اللغة" },
};

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

type I18nCtx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const Ctx = createContext<I18nCtx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem(STORAGE_KEY) as Lang | null) : null;
    if (stored && stored in DICTS) {
      setLangState(stored);
      return;
    }
    // Browser fallback first
    const browser = (typeof navigator !== "undefined" ? navigator.language.slice(0, 2) : "en") as Lang;
    if (browser in DICTS) setLangState(browser);

    // IP-based detection (overrides browser if country maps)
    let cancelled = false;
    fetch("https://ipapi.co/json/")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.country_code) return;
        const mapped = COUNTRY_LANG[data.country_code as string];
        if (mapped && !localStorage.getItem(STORAGE_KEY)) setLangState(mapped);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, l);
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang]);

  const value = useMemo<I18nCtx>(() => ({
    lang,
    setLang,
    t: (k) => DICTS[lang][k] ?? DICTS.en[k] ?? k,
  }), [lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}
