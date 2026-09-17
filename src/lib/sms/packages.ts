export const SMS_PACKAGE_IDS = [
  "pack_10",
  "pack_2000",
  "pack_5000",
  "pack_10000",
] as const;

export type SmsPackageId = (typeof SMS_PACKAGE_IDS)[number];

export type SmsPackage = {
  id: string;
  smsCredits: number;
  amountIls: number;
  label: string;
  featured?: boolean;
};

export const DEFAULT_SMS_PACKAGES: readonly SmsPackage[] = [
  {
    id: "pack_10",
    smsCredits: 10,
    amountIls: 1,
    label: "10 הודעות SMS",
  },
  {
    id: "pack_2000",
    smsCredits: 2000,
    amountIls: 60,
    label: "2,000 הודעות SMS",
  },
  {
    id: "pack_5000",
    smsCredits: 5000,
    amountIls: 130,
    label: "5,000 הודעות SMS",
    featured: true,
  },
  {
    id: "pack_10000",
    smsCredits: 10000,
    amountIls: 200,
    label: "10,000 הודעות SMS",
  },
];

export function listSmsPackages(): SmsPackage[] {
  return DEFAULT_SMS_PACKAGES.map((pack) => ({ ...pack }));
}

export function getSmsPackage(packageId: string): SmsPackage | null {
  return DEFAULT_SMS_PACKAGES.find((pack) => pack.id === packageId) ?? null;
}

export function isSmsPackageId(value: unknown): value is SmsPackageId {
  return (
    typeof value === "string" &&
    (SMS_PACKAGE_IDS as readonly string[]).includes(value)
  );
}
