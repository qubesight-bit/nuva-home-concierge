import { Link } from "@tanstack/react-router";
import { Star, BadgeCheck, Zap, Heart } from "lucide-react";
import { useState } from "react";
import type { Provider } from "@/lib/providers";

export default function ProviderCard({ provider }: { provider: Provider }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-card shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
      <Link to="/providers/$id" params={{ id: provider.id }} className="block">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={provider.image}
            alt={`${provider.name}, professional housekeeper in ${provider.location}`}
            loading="lazy"
            width={768}
            height={960}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
          {provider.instantBook && (
            <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full glass px-3 py-1.5 text-xs font-semibold">
              <Zap className="h-3 w-3 text-gold" /> Instant Book
            </span>
          )}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
            <div>
              <p className="flex items-center gap-1.5 text-lg font-semibold">
                {provider.name}
                <BadgeCheck className="h-4 w-4 text-gold" aria-label="Verified" />
              </p>
              <p className="text-sm text-white/80">{provider.location}</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Star className="h-4 w-4 fill-gold text-gold" />
              {provider.rating.toFixed(2)}
              <span className="text-muted-foreground">({provider.reviews})</span>
            </div>
            <p className="text-sm">
              <span className="text-lg font-bold">${provider.rate}</span>
              <span className="text-muted-foreground">/hr</span>
            </p>
          </div>
          <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{provider.tagline}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {provider.languages.slice(0, 3).map((l) => (
              <span
                key={l}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </Link>
      <button
        onClick={() => setSaved(!saved)}
        aria-label={saved ? "Remove from favorites" : "Save to favorites"}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full glass transition-transform hover:scale-110"
      >
        <Heart
          className={`h-4 w-4 transition-colors ${saved ? "fill-gold text-gold" : "text-foreground"}`}
        />
      </button>
    </div>
  );
}
