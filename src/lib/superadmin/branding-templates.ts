/**
 * Branding file templates uploaded to `app_design/branding/<clientName>/`.
 * Kept byte-compatible with the RN app's `createBusiness` so
 * `scripts/pull-branding.mjs <clientName>` produces a runnable client.
 */

export interface BrandingTemplateInput {
  businessId: string;
  businessName: string;
  clientName: string;
  /** `clientName.toLowerCase()` — Expo slug, bundle id and scheme. */
  slug: string;
  primaryColor: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  pulseemApiKey?: string;
  pulseemFromNumber?: string;
  pulseemUserId?: string;
  pulseemPassword?: string;
}

export function buildEnvFile(input: BrandingTemplateInput): string {
  const pulse: string[] = [
    '',
    '# Pulseem — מפתח מ«הגדרות API» (חשבון משנה), ל-Edge / אינטגרציות',
  ];

  pulse.push(
    input.pulseemApiKey ? `PULSEEM_API_KEY=${input.pulseemApiKey}` : '# PULSEEM_API_KEY=',
  );
  pulse.push(
    input.pulseemFromNumber
      ? `PULSEEM_FROM_NUMBER=${input.pulseemFromNumber}`
      : '# PULSEEM_FROM_NUMBER=',
  );

  pulse.push('', '# Pulseem — Web Service (שליחת SMS / OTP ב-Edge)', '');

  pulse.push(input.pulseemUserId ? `PULSEEM_USER_ID=${input.pulseemUserId}` : '# PULSEEM_USER_ID=');
  pulse.push(
    input.pulseemPassword ? `PULSEEM_PASSWORD=${input.pulseemPassword}` : '# PULSEEM_PASSWORD=',
  );
  pulse.push('');

  return [
    `# ${input.businessName} Environment Configuration`,
    `EXPO_PUBLIC_SUPABASE_URL=${input.supabaseUrl}`,
    `EXPO_PUBLIC_SUPABASE_ANON_KEY=${input.supabaseAnonKey}`,
    `EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=${input.supabaseServiceRoleKey}`,
    `BUSINESS_ID=${input.businessId}`,
    `CLIENT_NAME=${input.clientName}`,
    ...pulse,
  ].join('\n');
}

export function buildAppConfig(input: BrandingTemplateInput): Record<string, unknown> {
  const { clientName, slug, businessName, businessId } = input;

  return {
    expo: {
      name: businessName,
      slug,
      version: '1.0.0',
      orientation: 'portrait',
      icon: `./branding/${clientName}/icon.png`,
      scheme: slug,
      userInterfaceStyle: 'automatic',
      splash: {
        image: `./branding/${clientName}/splash.png`,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
      ios: {
        buildNumber: '1',
        supportsTablet: true,
        bundleIdentifier: `com.${slug}.app`,
        infoPlist: {
          ITSAppUsesNonExemptEncryption: false,
          CFBundleDevelopmentRegion: 'en',
          CFBundleAllowMixedLocalizations: true,
          NSPhotoLibraryUsageDescription:
            'The app needs access to photos to select and upload images to the gallery or profile.',
          NSPhotoLibraryAddUsageDescription:
            "The app may save photos you've taken to your photo library.",
          NSCameraUsageDescription:
            'The app needs access to the camera to take photos for upload.',
        },
        jsEngine: 'hermes',
      },
      android: {
        package: `com.${slug}.app`,
        versionCode: 1,
        adaptiveIcon: {
          foregroundImage: `./branding/${clientName}/icon.png`,
          backgroundColor: '#ffffff',
        },
        intentFilters: [
          {
            autoVerify: true,
            action: 'VIEW',
            data: { scheme: 'https', host: `${slug}.com` },
            category: ['BROWSABLE', 'DEFAULT'],
          },
        ],
        supportsRtl: false,
      },
      web: { favicon: `./branding/${clientName}/icon.png` },
      plugins: [
        ['expo-router', { origin: `https://${slug}.com/` }],
        ['expo-notifications', { color: '#ffffff' }],
        'expo-web-browser',
        'expo-font',
        'expo-localization',
      ],
      experiments: { typedRoutes: true },
      locales: { he: './assets/locales/he.json' },
      extra: {
        router: { origin: `https://${slug}.com/` },
        eas: { projectId: '' },
        locale: 'en',
        CLIENT: clientName,
        BUSINESS_ID: businessId,
        logo: `./branding/${clientName}/logo.png`,
        logoWhite: `./branding/${clientName}/logo-white.png`,
      },
    },
  };
}

export function buildTheme(input: BrandingTemplateInput): Record<string, unknown> {
  const { clientName, slug, businessName, primaryColor } = input;

  return {
    colors: {
      primary: primaryColor,
      secondary: `${primaryColor}CC`,
      accent: '#FF3B30',
      background: '#FFFFFF',
      surface: '#F2F2F7',
      text: '#1C1C1E',
      textSecondary: '#8E8E93',
      border: '#E5E5EA',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      info: '#007AFF',
    },
    branding: {
      logo: `./branding/${clientName}/logo.png`,
      logoWhite: `./branding/${clientName}/logo-white.png`,
      companyName: businessName,
      website: `https://${slug}.com`,
      supportEmail: `support@${slug}.com`,
    },
    fonts: { primary: 'System', secondary: 'System' },
  };
}
