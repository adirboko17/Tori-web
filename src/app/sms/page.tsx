import type { Metadata } from "next";
import { SmsShop } from "./sms-shop";
import "./sms.css";

export const metadata: Metadata = {
  title: "הוספת הודעות SMS",
  description: "רכישת הודעות SMS למנהלי עסק בתורי.",
};

export default function SmsPage() {
  return <SmsShop />;
}
