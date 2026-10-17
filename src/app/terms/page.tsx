import { LegalPage } from "@/components/legal-page";
import ServiceAgreement from "@/components/service-agreement";

export const metadata = { title: "תקנון" };
export default function Terms() {
  return (
    <LegalPage title="תקנון">
      <ServiceAgreement />
    </LegalPage>
  );
}
