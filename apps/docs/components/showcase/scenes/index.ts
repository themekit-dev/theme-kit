import { AnalyticsComposition } from "./analytics";
import { ComponentGalleryComposition } from "./component-gallery";
import { DashboardComposition } from "./dashboard";
import { DocumentationComposition } from "./documentation";
import { EcommerceComposition } from "./ecommerce";
import { MarketingComposition } from "./marketing";
import { SaasSettingsComposition } from "./saas-settings";

/**
 * The showcase scenes, keyed by the ids used in `lib/showcase.ts`.
 *
 * Each is a purpose-built mock interface built from the shared primitives in
 * `../ui`, so they share one product vocabulary — the same app shell, the same
 * chart rendering, the same table rows — and differ only in composition.
 */
export const COMPOSITIONS = {
  dashboard: DashboardComposition,
  analytics: AnalyticsComposition,
  "saas-settings": SaasSettingsComposition,
  ecommerce: EcommerceComposition,
  documentation: DocumentationComposition,
  marketing: MarketingComposition,
  "component-gallery": ComponentGalleryComposition,
} as const;

export type CompositionId = keyof typeof COMPOSITIONS;
