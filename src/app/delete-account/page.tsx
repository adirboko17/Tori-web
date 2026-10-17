import { LegalPage } from "@/components/legal-page";
import {
  DEVELOPER_ACCOUNT_NAME,
  FALLBACK_PRIVACY_APPS,
  listPrivacyPolicyApps,
} from "@/lib/admin/privacy-apps";
import { DeleteAccountForm } from "./delete-account-form";

export const metadata = { title: "מחיקת חשבון ומידע" };
export const dynamic = "force-dynamic";

const listStyle = {
  margin: 0,
  paddingInlineStart: "1.25em",
  listStyle: "disc",
  display: "grid",
  gap: 6,
} as const;

export default async function DeleteAccountPage() {
  let apps: { id: string; name: string; bundle_id: string }[] = FALLBACK_PRIVACY_APPS;
  try {
    apps = await listPrivacyPolicyApps();
  } catch {
    apps = FALLBACK_PRIVACY_APPS;
  }

  return (
    <LegalPage title="מחיקת חשבון ומידע">
      <section style={{ display: "grid", gap: 12 }}>
        <p>
          אם יש לכם חשבון באחת מהאפליקציות המופעלות באמצעות Tori, תוכלו לבקש
          למחוק את החשבון שלכם ואת המידע המשויך אליו.
        </p>
        <p>
          העמוד חל על אפליקציות קביעת התורים הממותגות המופעלות באמצעות פלטפורמת
          Tori ומפורסמות ב-App Store וב-Google Play תחת חשבון המפתח{" "}
          {DEVELOPER_ACCOUNT_NAME}.
        </p>
        <p>האפליקציות:</p>
        <ul style={listStyle}>
          {apps.map((app) => (
            <li key={app.id}>
              {app.name} - <span dir="ltr">{app.bundle_id}</span>
            </li>
          ))}
        </ul>
        <p>
          ניתן למחוק חשבון גם ישירות מתוך האפליקציה: פרופיל אישי → מחיקת חשבון.
        </p>
        <p>
          אם אין לכם יותר גישה לאפליקציה, ניתן לשלוח בקשת מחיקה באמצעות הטופס
          בעמוד זה.
        </p>
      </section>
      <DeleteAccountForm />
    </LegalPage>
  );
}
