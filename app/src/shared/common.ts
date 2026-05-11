// URLs internas: se adaptan al dominio actual (local o producción)
const origin = typeof window !== "undefined" ? window.location.origin : "";
const host = typeof window !== "undefined" ? window.location.host : "";
const protocol = typeof window !== "undefined" ? window.location.protocol : "https:";

export const DocsUrl = `${protocol}//docs.${host}`;
export const BlogUrl = `${protocol}//docs.${host}/blog`;
export const WhitepaperUrl = `${protocol}//docs.${host}/whitepaper`;
export const ContactUrl = `${origin}/contact`;
export const PrivacyUrl = `${origin}/privacy`;
export const TermsUrl = `${origin}/terms`;
export const SyscoinUrl = "https://syscoin.org/";
export const ContactEmail = "qawi.info.peru@gmail.com";

export const socialLinks = {
  linkedin: "https://www.linkedin.com/company/alivia-sbs",
  discord: "https://discord.com/channels/1502883266208862339",
  twitter: "https://x.com/Aliviasbs",
  tiktok: "https://www.tiktok.com/@alivia.sbs",
  facebook: "https://www.facebook.com/profile.php?id=61589710612517",
  instagram: "https://www.instagram.com/alivia.sbs",
};
