import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightBlog from "starlight-blog";

import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://docs.alivia.sbs",
  trailingSlash: "always",
  integrations: [
    starlight({
      title: "ALIVIA Docs",
      customCss: ["./src/styles/tailwind.css"],
      description: "Documentación de ALIVIA — agente IA anti-corrupción con grafo público en Syscoin.",
      logo: {
        src: "/src/assets/logo.webp",
        alt: "ALIVIA",
      },
      editLink: {
        baseUrl: "https://github.com/BenjaminGhiggo/alivia",
      },
      social: {
        twitter: "https://x.com/Aliviasbs",
        discord: "https://discord.com/channels/1502883266208862339",
      },
      sidebar: [
        {
          label: "Introducción",
          items: [
            { label: "¿Qué es ALIVIA?", link: "/" },
            { label: "Arquitectura", link: "/guides/architecture/" },
            { label: "Whitepaper", link: "/whitepaper/" },
          ],
        },
        {
          label: "Guías",
          items: [
            { label: "Inicio rápido", link: "/guides/quickstart/" },
          ],
        },
        {
          label: "Probar Alivia",
          items: [
            { label: "Casos de uso para probar", link: "/qa-checklist/" },
          ],
        },
      ],
      plugins: [
        starlightBlog({
          title: "Blog",
          customCss: ["./src/styles/tailwind.css"],
          authors: {
            alivia: {
              name: "Equipo ALIVIA",
              title: "Dev @ ALIVIA",
              url: "https://alivia.sbs",
            },
          },
        }),
      ],
    }),
    tailwind({ applyBaseStyles: false }),
  ],
});
