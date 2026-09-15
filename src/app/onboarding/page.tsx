import type { Metadata } from "next";
import Onboarding from "@/components/onboarding/Onboarding";
import "@/components/onboarding/onboarding.css";

export const metadata: Metadata = { title: "הרשמה והקמת האפליקציה" };
export default function OnboardingPage() {
  return <Onboarding />;
}
