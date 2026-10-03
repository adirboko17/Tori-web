import { appSiteUrl } from "@/lib/admin/app-site-url";
import type { AdminBusiness } from "@/lib/admin/businesses";
import { SUBSCRIPTION_STATUS } from "../../_ui/format";
import { Badge } from "../../_ui/parts";

export function AppSiteLink({ clientName }: { clientName: string | null | undefined }) {
  const href = appSiteUrl(clientName);
  if (!href) return "—";
  return (
    <a
      className="ad-link ad-ltr"
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => event.stopPropagation()}
    >
      {href}
    </a>
  );
}

export function SubscriptionBadge({
  business,
}: {
  business: Pick<AdminBusiness, "subscription" | "openCancellation">;
}) {
  const status = business.openCancellation
    ? SUBSCRIPTION_STATUS.cancelling
    : SUBSCRIPTION_STATUS[business.subscription];
  return (
    <Badge tone={status.tone} dot>
      {status.label}
    </Badge>
  );
}
