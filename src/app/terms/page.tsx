import { LegalPage } from "@/components/legal-page";
import ServiceAgreement from "@/components/service-agreement";

export const metadata = { title: "תנאי שימוש" };
export default function Terms() {
  return (
    <LegalPage title="תנאי שימוש">
      <ServiceAgreement />
    </LegalPage>
  );
}
