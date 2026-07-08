import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe2, LayoutGrid, Map, MapPin, Search, SlidersHorizontal, Star, Users, X, Zap } from "lucide-react";
import { COUNTRIES, GENDERS, detectCountryCode, providers, type Gender } from "@/lib/providers";
import ProviderCard from "@/components/site/ProviderCard";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse Verified Housekeepers by Country | Nuva" },
      {
        name: "description",
        content:
          "Browse verified, background-checked professional housekeepers by country and category — women and trans women. Strictly non-sexual nude housekeeping.",
      },
      { property: "og:title", content: "Browse Verified Housekeepers by Country | Nuva" },
      { property: "og:description", content: "Filter by country, category, price, language, and rating." },
    ],
  }),
  component: BrowsePage,
});

const allLanguages = [...new Set(providers.flatMap((p) => p.languages))].sort();
// Countries that currently have at least one provider — only show these in the picker
const availableCountries = COUNTRIES.filter((c) =>
  providers.some((p) => p.countryCode === c.code),
);

type CategoryFilter = "all" | Gender;

function BrowsePage() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<string>(""); // "" = all countries
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [maxRate, setMaxRate] = useState(60);
  const [language, setLanguage] = useState<string>("");
  const [minRating, setMinRating] = useState(0);
  const [instantOnly, setInstantOnly] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Auto-select the viewer's country on first client render, if we have providers there.
  useEffect(() => {
    const detected = detectCountryCode();
    if (availableCountries.some((c) => c.code === detected)) {
      setCountry(detected);
    }
  }, []);

  const filtered = useMemo(
    () =>
      providers.filter(
        (p) =>
          (p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.location.toLowerCase().includes(query.toLowerCase()) ||
            p.country.toLowerCase().includes(query.toLowerCase())) &&
          (!country || p.countryCode === country) &&
          (category === "all" || p.gender === category) &&
          p.rate <= maxRate &&
          (!language || p.languages.includes(language)) &&
          p.rating >= minRating &&
          (!instantOnly || p.instantBook),
      ),
    [query, country, category, maxRate, language, minRating, instantOnly],
  );

  const activeCountry = availableCountries.find((c) => c.code === country);

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <label htmlFor="country" className="flex items-center gap-2 text-sm font-semibold">
          <Globe2 className="h-4 w-4 text-gold" /> Country
        </label>
        <select
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="mt-3 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-soft outline-none transition-shadow focus:ring-2 focus:ring-ring/40"
        >
          <option value="">All countries</option>
          {availableCountries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag}  {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="max-rate" className="text-sm font-semibold">
          Max hourly rate — <span className="text-gold-foreground">${maxRate}</span>
        </label>
        <input
          id="max-rate"
          type="range"
          min={30}
          max={60}
          value={maxRate}
          onChange={(e) => setMaxRate(Number(e.target.value))}
          className="mt-3 w-full accent-[var(--gold)]"
        />
      </div>
      <div>
        <p className="text-sm font-semibold">Language</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {allLanguages.map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(language === l ? "" : l)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                language === l
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold">Minimum rating</p>
        <div className="mt-3 flex gap-2">
          {[0, 4.9, 4.95].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                minRating === r
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {r === 0 ? "Any" : <><Star className="h-3 w-3 fill-current" /> {r}+</>}
            </button>
          ))}
        </div>
      </div>
      <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-secondary px-4 py-3.5">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Zap className="h-4 w-4 text-gold" /> Instant Book only
        </span>
        <input
          type="checkbox"
          checked={instantOnly}
          onChange={(e) => setInstantOnly(e.target.checked)}
          className="h-4 w-4 accent-[var(--gold)]"
        />
      </label>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Browse professionals</h1>
          <p className="mt-2 text-muted-foreground">
            {filtered.length} verified housekeeper{filtered.length !== 1 && "s"}
            {activeCountry ? ` in ${activeCountry.flag} ${activeCountry.name}` : " worldwide"}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-soft">
          <button
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" /> List
          </button>
          <button
            onClick={() => setView("map")}
            aria-pressed={view === "map"}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              view === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Map className="h-4 w-4" /> Map
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div
        role="tablist"
        aria-label="Provider category"
        className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-soft"
      >
        {(
          [
            { id: "all" as const, label: "All", icon: Users },
            ...GENDERS.map((g) => ({ id: g.id, label: g.label, icon: Users })),
          ]
        ).map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={category === c.id}
            onClick={() => setCategory(c.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              category === c.id
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city, or country…"
            aria-label="Search providers"
            className="w-full rounded-full border border-border bg-card py-3.5 pl-11 pr-4 text-sm shadow-soft outline-none transition-shadow focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3.5 text-sm font-medium shadow-soft transition-all hover:shadow-lift lg:hidden"
          aria-expanded={filtersOpen}
        >
          {filtersOpen ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
          Filters
        </button>
      </div>

      {filtersOpen && (
        <div className="mt-4 rounded-3xl border border-border bg-card p-6 shadow-soft lg:hidden">
          {filterPanel}
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </h2>
            {filterPanel}
          </div>
        </aside>

        <div>
          <AnimatePresence mode="wait">
            {view === "list" ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
              >
                {filtered.map((p) => (
                  <ProviderCard key={p.id} provider={p} />
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-full rounded-3xl border border-dashed border-border py-20 text-center text-muted-foreground">
                    No providers match your filters. Try widening your search or switching country.
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="relative min-h-[560px] overflow-hidden rounded-3xl border border-border bg-secondary shadow-soft"
              >
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                  }}
                  aria-hidden
                />
                {filtered.map((p, i) => (
                  <div
                    key={p.id}
                    className="absolute"
                    style={{
                      left: `${18 + ((i * 29) % 64)}%`,
                      top: `${16 + ((i * 37) % 62)}%`,
                    }}
                  >
                    <div className="group relative">
                      <div className="flex cursor-pointer items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-lift transition-transform hover:scale-110">
                        <MapPin className="h-3 w-3 text-gold" /> ${p.rate}
                      </div>
                      <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-48 -translate-x-1/2 rounded-2xl bg-card p-3 opacity-0 shadow-lift transition-opacity group-hover:opacity-100">
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.flag} {p.location}, {p.country}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full glass px-5 py-2.5 text-xs font-medium text-muted-foreground">
                  Interactive map — live GPS view arrives with the full release
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
