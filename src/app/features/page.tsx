import type { Metadata } from "next";
import FeaturesPage from "@/components/features/FeaturesPage";
import "@/components/landing/landing.css";
import "@/components/landing/landing-mobile.css";
import "@/components/landing/landing-menu.css";
import "@/components/landing/landing-brand.css";
import "@/components/landing/app-screens/app-screens.css";
import "@/components/features/features.css";

export const metadata: Metadata = {
  title: "כל היכולות של תורי",
  description: "כל מה שאפליקציית התורים הממותגת של תורי יודעת לעשות, ללקוחות ולבעלי העסק, עם הדגמה לכל יכולת.",
};

export default function FeaturesRoute() {
  return <FeaturesPage />;
}
