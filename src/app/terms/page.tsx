import { LegalPage } from "@/components/legal-page";
import ServiceAgreement from "@/components/service-agreement";

export const metadata = { title: "הסכם שירות" };
export default function Terms() {
  return (
    <LegalPage title="הסכם שירות">
      <ServiceAgreement />
    </LegalPage>
  );
}
