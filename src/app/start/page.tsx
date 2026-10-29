import type { Metadata } from "next";
import CampaignPage from "@/components/campaign/CampaignPage";
import "@/components/campaign/campaign.css";

export const metadata: Metadata = {
  title: "אפליקציה משלך לעסק",
  description: "אפליקציית תורים ממותגת עם השם, הלוגו והצבעים של העסק שלך. משאירים פרטים ואנחנו חוזרים אליכם תוך שעה.",
  robots: { index: false, follow: false },
};

export default function StartRoute() {
  return <CampaignPage />;
}
