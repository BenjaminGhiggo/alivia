import { routes } from "wasp/client/router";
import { BlogUrl, DocsUrl } from "../../../shared/common";
import type { NavigationItem } from "./NavBar";

export const marketingNavigationItems: NavigationItem[] = [
  { name: "Cómo funciona", to: "/#how-it-works" },
  { name: "Seguridad", to: "/#security" },
  { name: "Precios", to: routes.PricingPageRoute.to },
  { name: "Blog", to: BlogUrl },
  { name: "Docs", to: DocsUrl },
] as const;

export const demoNavigationitems: NavigationItem[] = [
  { name: "Dashboard", to: routes.DemoAppRoute.to },
  { name: "Docs", to: DocsUrl },
] as const;
