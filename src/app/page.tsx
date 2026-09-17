import { loadMonthlyPriceIls } from "@/lib/admin/catalog";
import Landing from "@/components/landing/Landing";
import "@/components/landing/landing.css";
import "@/components/landing/landing-mobile.css";
import "@/components/landing/landing-loader.css";
import "@/components/landing/landing-menu.css";

export default async function HomePage() {
  const monthlyPrice = await loadMonthlyPriceIls();
  return <Landing monthlyPrice={monthlyPrice} />;
}
