import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Globe,
  MessageSquare,
  ShieldCheck,
  Star,
  Zap,
  Clock,
  Sparkles,
} from "lucide-react";
import { getProvider, providers, getCountry, type Provider } from "@/lib/providers";
import { browseSearchValidator, safeCategory } from "@/lib/browse-search";
import { Reveal } from "@/components/site/Reveal";
import ProviderCard from "@/components/site/ProviderCard";


export const Route = createFileRoute("/providers/$id")({
  validateSearch: browseSearchValidator,
  loader: ({ params }): { provider: Provider } => {
    const provider = getProvider(params.id);
    if (!provider) throw notFound();
    return { provider };
  },

  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Provider not found | Nuva" }, { name: "robots", content: "noindex" }] };
    }
    const { provider } = loaderData;
    return {
      meta: [
        { title: `${provider.name} — Professional Housekeeper | Nuva` },
        { name: "description", content: `${provider.tagline}. ${provider.rating} rating from ${provider.reviews} verified reviews. Book from $${provider.rate}/hr.` },
        { property: "og:title", content: `${provider.name} — Professional Housekeeper | Nuva` },
        { property: "og:description", content: provider.tagline },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <h1 className="text-3xl font-bold">Provider not found</h1>
      <p className="mt-3 text-muted-foreground">This profile may have been removed or is unavailable.</p>
      <Link to="/browse" className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
        Browse all providers
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <Link to="/browse" className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
        Browse all providers
      </Link>
    </div>
  ),
  component: ProviderProfile,
});

const mockReviews = [
  { name: "Charlotte W.", date: "2 weeks ago", rating: 5, text: "Absolutely immaculate work. Punctual, discreet, and left the apartment feeling like a five-star suite." },
  { name: "James R.", date: "1 month ago", rating: 5, text: "Consistently excellent over six months of weekly visits. Communication through the app is seamless." },
  { name: "Priya S.", date: "2 months ago", rating: 5, text: "Handled our delicate surfaces with real expertise. The GPS check-in gives great peace of mind." },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ProviderProfile() {
  const { provider } = Route.useLoaderData();
  const search = Route.useSearch();
  const activeCategory = safeCategory(search.category);
  const activeCountry = search.country ? getCountry(search.country) : undefined;
  const hasFilter = !!activeCountry || activeCategory !== "all";
  const others = providers.filter((p) => p.id !== provider.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      {hasFilter && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-soft">
          <Link
            to="/browse"
            search={{ country: search.country, category: search.category }}
            className="inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to results
          </Link>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">Filtered by</span>
          {activeCountry && (
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
              {activeCountry.flag} {activeCountry.name}
            </span>
          )}
          {activeCategory !== "all" && (
            <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-gold-foreground">
              {activeCategory === "trans-woman" ? "Trans Woman" : "Woman"}
            </span>
          )}
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          {/* Header */}
          <div className="flex flex-col gap-8 sm:flex-row">
            <div className="w-full max-w-[280px] shrink-0 overflow-hidden rounded-3xl shadow-lift">
              <img
                src={provider.image}
                alt={`${provider.name}, professional housekeeper`}
                width={768}
                height={960}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                  <span aria-hidden>{provider.flag}</span> {provider.country}
                </span>
                <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-gold-foreground">
                  {provider.gender === "trans-woman" ? "Trans Woman" : "Woman"}
                </span>
                {provider.badges.map((b: string) => (
                  <span key={b} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                    <BadgeCheck className="h-3 w-3 text-gold" /> {b}
                  </span>
                ))}
              </div>
              <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{provider.name}</h1>
              <p className="mt-1 text-muted-foreground">{provider.location}, {provider.country}</p>
              <div className="mt-4 flex flex-wrap items-center gap-5 text-sm">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Star className="h-4 w-4 fill-gold text-gold" /> {provider.rating.toFixed(2)}
                  <span className="font-normal text-muted-foreground">({provider.reviews} reviews)</span>
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" /> {provider.experience} years experience
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Globe className="h-4 w-4" /> {provider.languages.join(", ")}
                </span>
              </div>

              <p className="mt-5 leading-relaxed text-muted-foreground">{provider.bio}</p>
              <button className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold shadow-soft transition-all hover:shadow-lift">
                <MessageSquare className="h-4 w-4" /> Message {provider.name.split(" ")[0]}
              </button>
            </div>
          </div>

          {/* Services */}
          <Reveal className="mt-14">
            <h2 className="text-xl font-bold">Services offered</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {provider.services.map((s: string) => (
                <div key={s} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-soft">
                    <Sparkles className="h-4 w-4 text-gold-foreground" />
                  </div>
                  <p className="text-sm font-semibold">{s}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Availability */}
          <Reveal className="mt-14">
            <h2 className="text-xl font-bold">Weekly availability</h2>
            <div className="mt-5 grid grid-cols-7 gap-2">
              {days.map((d, i) => {
                const available = i !== 6 && !(provider.id.length % 2 === 0 && i === 5);
                return (
                  <div
                    key={d}
                    className={`rounded-2xl py-4 text-center text-sm font-medium ${
                      available ? "bg-gold-soft text-gold-foreground" : "bg-secondary text-muted-foreground line-through"
                    }`}
                  >
                    {d}
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Reviews */}
          <Reveal className="mt-14">
            <h2 className="text-xl font-bold">Verified reviews</h2>
            <div className="mt-5 space-y-4">
              {mockReviews.map((r) => (
                <div key={r.name} className="rounded-3xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{r.name}</p>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                  <div className="mt-1.5 flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Policies */}
          <Reveal className="mt-14">
            <h2 className="text-xl font-bold">Policies</h2>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2.5"><ShieldCheck className="h-4 w-4 shrink-0 text-gold" /> Free cancellation up to 24 hours before your appointment.</li>
              <li className="flex gap-2.5"><ShieldCheck className="h-4 w-4 shrink-0 text-gold" /> All payments are processed securely through the platform — never in cash.</li>
              <li className="flex gap-2.5"><ShieldCheck className="h-4 w-4 shrink-0 text-gold" /> GPS check-in/check-out on every appointment for mutual safety.</li>
            </ul>
          </Reveal>
        </div>

        {/* Booking sidebar */}
        <aside>
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-7 shadow-lift">
            <p className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">${provider.rate}</span>
              <span className="text-muted-foreground">/hour</span>
            </p>
            {provider.instantBook && (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-gold-foreground">
                <Zap className="h-4 w-4" /> Instant booking available
              </p>
            )}
            <div className="mt-5 space-y-2.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Usually responds within 1 hour</p>
              <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Payment protected by Nuva</p>
            </div>
            <Link
              to="/book/$id"
              params={{ id: provider.id }}
              className="mt-7 block rounded-full bg-gradient-gold py-4 text-center text-base font-semibold text-black shadow-gold transition-transform hover:scale-[1.02]"
            >
              Book {provider.name.split(" ")[0]}
            </Link>
            <p className="mt-4 text-center text-xs text-muted-foreground">You won't be charged yet</p>
          </div>
        </aside>
      </div>

      {/* More providers */}
      <div className="mt-24">
        <h2 className="text-2xl font-bold">Other professionals nearby</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
