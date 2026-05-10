import { ContactUrl, DocsUrl, PrivacyUrl, TermsUrl } from "../shared/common";
import type { GridFeature } from "./components/FeaturesGrid";
import type { FAQ } from "./components/FAQ";

export const features: GridFeature[] = [
  {
    name: "Seguridad Blockchain Antifraude",
    description: "Cada voto registrado en Syscoin (NEVM) como transacción inmutable",
    emoji: "🔗",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Verificación Inteligente con IA",
    description: "Detección de anomalías y patrones de fraude en tiempo real",
    emoji: "🤖",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Transparencia Auditable",
    description: "Resultados verificables por cualquier ciudadano en el explorador de bloques",
    emoji: "🔍",
    href: DocsUrl,
    size: "medium",
  },
  {
    name: "Identidad Digital Segura",
    description: "Verificación biométrica + documento para garantizar un voto por persona",
    emoji: "🆔",
    href: DocsUrl,
    size: "large",
  },
  {
    name: "Experiencia Accesible",
    description: "Interfaz intuitiva, votación desde cualquier dispositivo en minutos",
    emoji: "📱",
    href: DocsUrl,
    size: "large",
  },
  {
    name: "Cifrado de Extremo a Extremo",
    description: "Voto secreto protegido con criptografía de grado militar",
    emoji: "🔒",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Resultados en Tiempo Real",
    description: "Conteo automático e inmediato sin intervención humana",
    emoji: "📊",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Auditoría con IA",
    description: "Reportes automáticos de integridad post-elección",
    emoji: "📋",
    href: DocsUrl,
    size: "medium",
  },
  {
    name: "Escalabilidad LATAM",
    description: "Diseñado para soportar millones de votos simultáneos",
    emoji: "🌎",
    href: DocsUrl,
    size: "medium",
  },
];

export const testimonials = [
  {
    name: "Dra. María García",
    role: "Experta en Ciberseguridad Electoral",
    avatarSrc: "",
    socialUrl: "#",
    quote: "ALIVIA representa un salto cualitativo en transparencia electoral. La combinación de blockchain con IA para detección de anomalías es exactamente lo que el sector necesita.",
  },
  {
    name: "Carlos Mendoza",
    role: "Presidente Junta Vecinal",
    avatarSrc: "",
    socialUrl: "#",
    quote: "Por primera vez pudimos auditar cada voto de nuestra asamblea vecinal. Mis vecinos confían más en el proceso porque pueden verificar los resultados ellos mismos.",
  },
  {
    name: "Ana Lucía Torres",
    role: "CTO @ GovTech Latam",
    avatarSrc: "",
    socialUrl: "#",
    quote: "La arquitectura sobre Syscoin NEVM nos da la seguridad de Bitcoin con costos de transacción mínimos. Ideal para procesos electorales a gran escala en la región.",
  },
];

export interface FAQItem extends FAQ {
  id: number;
  question: string;
  answer: string;
}

export const faqs: FAQItem[] = [
  {
    id: 1,
    question: "¿Cómo garantiza ALIVIA que mi voto no sea alterado?",
    answer: "Cada voto se cifra de extremo a extremo y se registra como una transacción inmutable en la blockchain de Syscoin (NEVM). Una vez confirmado, nadie —ni siquiera nosotros— puede modificarlo o eliminarlo. Puedes verificar tu voto en el explorador de bloques usando tu código único de recibo.",
  },
  {
    id: 2,
    question: "¿Qué es Syscoin y por qué se usa como blockchain?",
    answer: "Syscoin es una blockchain de capa 1 que combina la seguridad del merge-mining con Bitcoin (la red más segura del mundo) con contratos inteligentes compatibles con Ethereum (NEVM). Ofrece transacciones de bajo costo (< $0.01 USD), alta velocidad (5 segundos de finality) y la robustez de una red consolidada.",
  },
  {
    id: 3,
    question: "¿Cómo funciona la verificación con inteligencia artificial?",
    answer: "Nuestro sistema de IA analiza patrones de votación en tiempo real para detectar anomalías como votos duplicados, accesos no autorizados o comportamientos inusuales. Los reportes de auditoría se generan automáticamente y están disponibles para revisión pública.",
    href: DocsUrl,
  },
  {
    id: 4,
    question: "¿Es compatible con las leyes electorales de mi país?",
    answer: "ALIVIA está diseñada para cumplir con los estándares internacionales de votación electrónica (ODIHR, OEA) y se adapta a los marcos legales locales. Trabajamos con asesores legales especializados en cada país para garantizar el cumplimiento normativo.",
  },
  {
    id: 5,
    question: "¿Qué pasa si pierdo mi conexión durante la votación?",
    answer: "El sistema guarda el progreso localmente y reanuda automáticamente cuando se restablece la conexión. Mientras no confirmes tu voto, no se registra en la blockchain. Además, el diseño offline-first permite operar en zonas con conectividad intermitente.",
  },
  {
    id: 6,
    question: "¿Cómo puedo auditar los resultados yo mismo?",
    answer: "Cada votante recibe un código de recibo único y anónimo. Con ese código, puedes verificar que tu voto fue contado correctamente en el explorador de bloques de Syscoin. Cualquier ciudadano puede auditar el resultado final sin necesidad de permisos especiales.",
  },
  {
    id: 7,
    question: "¿Qué datos personales almacena ALIVIA?",
    answer: "Solo almacenamos los datos mínimos necesarios para la verificación de identidad (nombre, documento, biometría). Tu voto es anónimo y no está vinculado a tu identidad en la blockchain. Cumplimos con GDPR y leyes de protección de datos locales.",
  },
];

export const footerNavigation = {
  app: [
    { name: "Documentación", href: DocsUrl },
    { name: "Blog", href: "https://blog.alivia.sbs" },
    { name: "Whitepaper", href: "https://docs.alivia.sbs/whitepaper" },
  ],
  company: [
    { name: "Contacto", href: ContactUrl },
    { name: "Privacidad", href: PrivacyUrl },
    { name: "Términos", href: TermsUrl },
  ],
};

export const examples = [
  {
    name: "Elecciones Municipales",
    description: "Votación popular para alcaldes y concejales con verificación biométrica.",
    imageSrc: "",
    href: "#",
  },
  {
    name: "Votaciones Gremiales",
    description: "Elecciones de juntas directivas en sindicatos y colegios profesionales.",
    imageSrc: "",
    href: "#",
  },
  {
    name: "Asambleas de Accionistas",
    description: "Votación corporativa con verificación de tenencia accionaria.",
    imageSrc: "",
    href: "#",
  },
  {
    name: "Presupuesto Participativo",
    description: "Decisión ciudadana sobre asignación de fondos públicos municipales.",
    imageSrc: "",
    href: "#",
  },
  {
    name: "Referéndums Ciudadanos",
    description: "Consultas populares vinculantes con resultados auditables en tiempo real.",
    imageSrc: "",
    href: "#",
  },
  {
    name: "Elecciones Universitarias",
    description: "Federaciones estudiantiles y centros académicos con alta participación móvil.",
    imageSrc: "",
    href: "#",
  },
];
