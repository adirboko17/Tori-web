import type { AdminBusiness } from "@/lib/admin/businesses";
import { SUBSCRIPTION_STATUS } from "../../_ui/format";
import { Badge } from "../../_ui/parts";

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
