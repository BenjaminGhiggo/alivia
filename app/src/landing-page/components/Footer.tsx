import { socialLinks, ContactEmail } from "../../shared/common";

interface NavigationItem {
  name: string;
  href: string;
}

const socialIcons = [
  { name: "LinkedIn", href: socialLinks.linkedin, icon: "in" },
  { name: "X", href: socialLinks.twitter, icon: "𝕏" },
  { name: "Instagram", href: socialLinks.instagram, icon: "📷" },
  { name: "TikTok", href: socialLinks.tiktok, icon: "♪" },
  { name: "Discord", href: socialLinks.discord, icon: "💬" },
  { name: "Facebook", href: socialLinks.facebook, icon: "f" },
];

export default function Footer({
  footerNavigation,
}: {
  footerNavigation: {
    app: NavigationItem[];
    company: NavigationItem[];
  };
}) {
  return (
    <div className="dark:bg-boxdark-2 mx-auto mt-6 max-w-7xl px-6 lg:px-8">
      <footer
        aria-labelledby="footer-heading"
        className="relative border-t border-gray-900/10 py-16 dark:border-gray-200/10"
      >
        <h2 id="footer-heading" className="sr-only">Footer</h2>
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="flex flex-col gap-4">
            <span className="text-lg font-bold text-foreground">ALIVIA</span>
            <p className="max-w-xs text-sm text-muted-foreground">
              El futuro del voto digital, seguro y transparente.
            </p>
            <a href={`mailto:${ContactEmail}`} className="text-sm text-muted-foreground hover:text-foreground">
              {ContactEmail}
            </a>
            <div className="flex gap-3">
              {socialIcons.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="flex gap-16">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Plataforma</h3>
              <ul role="list" className="mt-4 space-y-3">
                {footerNavigation.app.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Legal</h3>
              <ul role="list" className="mt-4 space-y-3">
                {footerNavigation.company.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-900/5 pt-6 text-center text-xs text-muted-foreground dark:border-gray-200/5">
          © {new Date().getFullYear()} ALIVIA. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
