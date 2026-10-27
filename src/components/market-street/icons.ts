import {
  Car,
  ChefHat,
  Crown,
  Glasses,
  Headphones,
  PartyPopper,
  Plane,
  ShieldCheck,
  ShoppingBasket,
  Snowflake,
  Store,
  Sunrise,
  Trophy,
  Umbrella,
  type LucideIcon,
} from "lucide-react";
import type { BadgeId, DreamId, HatId } from "@/lib/market-data";

export const BADGE_ICONS: Record<BadgeId, LucideIcon> = {
  early: Sunrise,
  basket: ShoppingBasket,
  cool: Snowflake,
  rainy: Umbrella,
  hype: ShieldCheck,
  dream: Trophy,
};

export const HAT_ICONS: Record<HatId, LucideIcon> = {
  party: PartyPopper,
  chef: ChefHat,
  shades: Glasses,
  headphones: Headphones,
  crown: Crown,
};

export const DREAM_ICONS: Record<DreamId, LucideIcon> = {
  car: Car,
  trip: Plane,
  business: Store,
};
