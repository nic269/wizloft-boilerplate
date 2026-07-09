import { appConfig } from "./app";
import { featureConfig } from "./features";

export const marketingNav = [
  { href: "/#features", label: "Features" },
  ...(featureConfig.docs ? [{ href: appConfig.docsUrl, label: "Docs" }] : []),
  ...(featureConfig.billing ? [{ href: "/pricing", label: "Pricing" }] : []),
] as const;

export const dashboardNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
  { href: "/settings/members", label: "Members" },
  { href: "/settings/access", label: "Access" },
] as const;
