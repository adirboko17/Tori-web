import { LegalPage } from "@/components/legal-page";
import { DeleteAccountForm } from "./delete-account-form";

export const metadata = { title: "מחיקת חשבון ומידע" };

export default function DeleteAccountPage() {
  return (
    <LegalPage title="מחיקת חשבון ומידע">
      <DeleteAccountForm />
    </LegalPage>
  );
}
