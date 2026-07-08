import provider1 from "@/assets/provider-1.jpg";
import provider2 from "@/assets/provider-2.jpg";
import provider3 from "@/assets/provider-3.jpg";
import provider4 from "@/assets/provider-4.jpg";
import provider5 from "@/assets/provider-5.jpg";
import provider6 from "@/assets/provider-6.jpg";

export interface Provider {
  id: string;
  name: string;
  location: string;
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

export const providers: Provider[] = [
  {
    id: "sofia-marchetti",
    name: "Sofia Marchetti",
    location: "Upper East Side, NY",
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
    location: "Tribeca, NY",
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
    id: "daniel-novak",
    name: "Daniel Novak",
    location: "Williamsburg, NY",
    rate: 45,
    rating: 4.92,
    reviews: 156,
    languages: ["English", "Czech", "German"],
    experience: 6,
    instantBook: false,
    tagline: "Systematic, spotless, always on time",
    bio: "A former facilities specialist, Daniel applies a methodical checklist approach so nothing is ever missed. Ideal for recurring weekly service and larger residences.",
    services: ["Signature Clean", "Move-In / Move-Out"],
    image: provider3,
    badges: ["ID Verified", "Background Checked"],
  },
  {
    id: "leila-haddad",
    name: "Leila Haddad",
    location: "SoHo, NY",
    rate: 50,
    rating: 4.97,
    reviews: 203,
    languages: ["English", "Arabic", "French"],
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
    location: "Greenwich Village, NY",
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
    id: "tomas-silva",
    name: "Tomas Silva",
    location: "Long Island City, NY",
    rate: 42,
    rating: 4.9,
    reviews: 128,
    languages: ["English", "Portuguese", "Spanish"],
    experience: 5,
    instantBook: false,
    tagline: "Energetic, thorough, great with pets",
    bio: "Tomas is known for transforming busy family homes. Pet-friendly, allergy-aware, and happy to work around your schedule with flexible evening slots.",
    services: ["Signature Clean", "Eco Luxe Clean"],
    image: provider6,
    badges: ["ID Verified", "Background Checked"],
  },
];

export const getProvider = (id: string) => providers.find((p) => p.id === id);
