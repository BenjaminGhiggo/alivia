import { routes } from "wasp/client/router";
import { BlogUrl, DocsUrl } from "../../../shared/common";
import type { NavigationItem } from "./NavBar";

export const marketingNavigationItems: NavigationItem[] = [
  { name: "Cómo funciona", to: "/#how-it-works" },
  { name: "Grafo", to: "/grafo" },
  { name: "Casos", to: "/casos" },
  { name: "Blog", to: BlogUrl },
  { name: "Docs", to: DocsUrl },
] as const;

export const demoNavigationitems: NavigationItem[] = [
  { name: "Grafo", to: "/grafo" },
  { name: "Admin", to: "/admin" },
  { name: "Docs", to: DocsUrl },
] as const;
