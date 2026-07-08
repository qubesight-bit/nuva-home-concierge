import provider1 from "@/assets/provider-1.jpg";
import provider2 from "@/assets/provider-2.jpg";
import provider3 from "@/assets/provider-3.jpg";
import provider4 from "@/assets/provider-4.jpg";
import provider5 from "@/assets/provider-5.jpg";
import provider6 from "@/assets/provider-6.jpg";

export type Gender = "woman" | "trans-woman";

export interface Provider {
  id: string;
  name: string;
  location: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  flag: string;
  gender: Gender;
  rate: number;
  rating: number;
  reviews: number;
  languages: string[];
  experience: number;
  instantBook: boolean;
  tagline: string;
  bio: string;
  services: string[];
  image: string;
  badges: string[];
}

export const SERVICES = [
  { id: "standard", name: "Signature Clean", desc: "Complete top-to-bottom home refresh", perHour: 0 },
  { id: "deep", name: "Deep Clean", desc: "Intensive detailing of every surface", perHour: 12 },
  { id: "move", name: "Move-In / Move-Out", desc: "Immaculate handover-ready finish", perHour: 15 },
  { id: "eco", name: "Eco Luxe Clean", desc: "Premium plant-based products only", perHour: 8 },
] as const;

export const EXTRAS = [
  { id: "laundry", name: "Laundry & Ironing", price: 35 },
  { id: "fridge", name: "Inside Fridge", price: 25 },
  { id: "oven", name: "Inside Oven", price: 30 },
  { id: "windows", name: "Interior Windows", price: 40 },
  { id: "organization", name: "Wardrobe Organization", price: 45 },
] as const;

export const GENDERS: { id: Gender; label: string; short: string }[] = [
  { id: "woman", label: "Woman", short: "Woman" },
  { id: "trans-woman", label: "Trans Woman", short: "Trans" },
];

export const COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
];

export const getCountry = (code: string) =>
  COUNTRIES.find((c) => c.code === code.toUpperCase());

/**
 * Best-effort browser locale → country code. Used to pre-select the
 * viewer's country on the browse page so results reflect where they are.
 */
export function detectCountryCode(): string {
  if (typeof navigator === "undefined") return "US";
  const lang = navigator.language || "en-US";
  const parts = lang.split("-");
  const region = (parts[1] || parts[0] || "US").toUpperCase();
  const match = COUNTRIES.find((c) => c.code === region);
  return match ? match.code : "US";
}

export const providers: Provider[] = [
  {
    id: "sofia-marchetti",
    name: "Sofia Marchetti",
    location: "Milan",
    country: "Italy",
    countryCode: "IT",
    flag: "🇮🇹",
    gender: "woman",
    rate: 48,
    rating: 4.98,
    reviews: 214,
    languages: ["English", "Italian", "French"],
    experience: 8,
    instantBook: true,
    tagline: "Detail-obsessed care for refined homes",
    bio: "Trained in five-star hospitality housekeeping in Milan, Sofia brings hotel-grade standards to private residences. She specializes in delicate surfaces, fine textiles, and discreet service for busy professionals.",
    services: ["Signature Clean", "Deep Clean", "Eco Luxe Clean"],
    image: provider1,
    badges: ["ID Verified", "Background Checked", "Top Rated"],
  },
  {
    id: "amara-chen",
    name: "Amara Chen",
    location: "Tribeca, New York",
    country: "United States",
    countryCode: "US",
    flag: "🇺🇸",
    gender: "woman",
    rate: 52,
    rating: 4.95,
    reviews: 187,
    languages: ["English", "Mandarin"],
    experience: 11,
    instantBook: true,
    tagline: "Eleven years of white-glove service",
    bio: "Amara has managed housekeeping for luxury lofts and penthouses across Manhattan for over a decade. Clients value her calm precision, punctuality, and absolute discretion.",
    services: ["Signature Clean", "Deep Clean", "Move-In / Move-Out"],
    image: provider2,
    badges: ["ID Verified", "Background Checked", "Superhost"],
  },
  {
    id: "isabela-costa",
    name: "Isabela Costa",
    location: "Jardins, São Paulo",
    country: "Brazil",
    countryCode: "BR",
    flag: "🇧🇷",
    gender: "trans-woman",
    rate: 38,
    rating: 4.94,
    reviews: 172,
    languages: ["Portuguese", "English", "Spanish"],
    experience: 6,
    instantBook: false,
    tagline: "Warm, precise, and endlessly thorough",
    bio: "Isabela built her reputation caring for design-led apartments across São Paulo. She loves working with natural materials and brings a calm, unhurried focus to every home.",
    services: ["Signature Clean", "Deep Clean"],
    image: provider3,
    badges: ["ID Verified", "Background Checked"],
  },
  {
    id: "leila-haddad",
    name: "Leila Haddad",
    location: "Le Marais, Paris",
    country: "France",
    countryCode: "FR",
    flag: "🇫🇷",
    gender: "woman",
    rate: 50,
    rating: 4.97,
    reviews: 203,
    languages: ["French", "English", "Arabic"],
    experience: 9,
    instantBook: true,
    tagline: "Luxury textile & surface specialist",
    bio: "Leila is trusted by interior designers for post-styling cleans and delicate material care — marble, brass, silk, and antique wood are her specialty.",
    services: ["Signature Clean", "Deep Clean", "Eco Luxe Clean"],
    image: provider4,
    badges: ["ID Verified", "Background Checked", "Top Rated"],
  },
  {
    id: "margaret-ellis",
    name: "Margaret Ellis",
    location: "Notting Hill, London",
    country: "United Kingdom",
    countryCode: "GB",
    flag: "🇬🇧",
    gender: "woman",
    rate: 58,
    rating: 4.99,
    reviews: 342,
    languages: ["English"],
    experience: 22,
    instantBook: true,
    tagline: "Two decades of estate housekeeping",
    bio: "Margaret spent 22 years managing private estates before joining Nuva. She offers full household management, seasonal deep cleans, and mentorship-level expertise.",
    services: ["Signature Clean", "Deep Clean", "Move-In / Move-Out", "Eco Luxe Clean"],
    image: provider5,
    badges: ["ID Verified", "Background Checked", "Superhost", "Top Rated"],
  },
  {
    id: "valentina-rojas",
    name: "Valentina Rojas",
    location: "Chueca, Madrid",
    country: "Spain",
    countryCode: "ES",
    flag: "🇪🇸",
    gender: "trans-woman",
    rate: 42,
    rating: 4.93,
    reviews: 148,
    languages: ["Spanish", "English", "Portuguese"],
    experience: 5,
    instantBook: true,
    tagline: "Bright, precise, endlessly professional",
    bio: "Valentina brings hospitality-grade discipline from Madrid's design hotel scene into private homes. Great with modern interiors, art-forward spaces, and busy households.",
    services: ["Signature Clean", "Eco Luxe Clean"],
    image: provider6,
    badges: ["ID Verified", "Background Checked"],
  },
];

export const getProvider = (id: string) => providers.find((p) => p.id === id);
