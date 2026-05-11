import { ContactUrl, DocsUrl, PrivacyUrl, TermsUrl } from "../shared/common";
import {
  Shield, Brain, Search, ScanFace, Smartphone,
  Lock, BarChart3, ClipboardCheck, Globe,
} from "lucide-react";
import type { FAQ } from "./components/FAQ";

export interface FeatureItem {
  name: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  accent: string;
}

export const features: FeatureItem[] = [
  {
    name: "Seguridad Blockchain Antifraude",
    description: "Cada voto registrado en Syscoin (NEVM) como transacción inmutable",
    icon: <Shield className="h-6 w-6 stroke-cyan-400" />,
    href: DocsUrl,
    accent: "from-cyan-400 to-blue-500",
  },
  {
    name: "Verificación Inteligente con IA",
    description: "Detección de anomalías y patrones de fraude en tiempo real",
    icon: <Brain className="h-6 w-6 stroke-purple-400" />,
    href: DocsUrl,
    accent: "from-purple-400 to-pink-500",
  },
  {
    name: "Transparencia Auditable",
    description: "Resultados verificables por cualquier ciudadano en el explorador de bloques",
    icon: <Search className="h-6 w-6 stroke-amber-400" />,
    href: DocsUrl,
    accent: "from-amber-400 to-orange-500",
  },
  {
    name: "Identidad Digital Segura",
    description: "Verificación biométrica + documento para garantizar un voto por persona",
    icon: <ScanFace className="h-6 w-6 stroke-emerald-400" />,
    href: DocsUrl,
    accent: "from-emerald-400 to-teal-500",
  },
  {
    name: "Experiencia Accesible",
    description: "Interfaz intuitiva, votación desde cualquier dispositivo en minutos",
    icon: <Smartphone className="h-6 w-6 stroke-sky-400" />,
    href: DocsUrl,
    accent: "from-sky-400 to-cyan-500",
  },
  {
    name: "Cifrado de Extremo a Extremo",
    description: "Voto secreto protegido con criptografía de grado militar",
    icon: <Lock className="h-6 w-6 stroke-red-400" />,
    href: DocsUrl,
    accent: "from-red-400 to-rose-500",
  },
  {
    name: "Resultados en Tiempo Real",
    description: "Conteo automático e inmediato sin intervención humana",
    icon: <BarChart3 className="h-6 w-6 stroke-violet-400" />,
    href: DocsUrl,
    accent: "from-violet-400 to-purple-500",
  },
  {
    name: "Auditoría con IA",
    description: "Reportes automáticos de integridad post-elección",
    icon: <ClipboardCheck className="h-6 w-6 stroke-lime-400" />,
    href: DocsUrl,
    accent: "from-lime-400 to-green-500",
  },
  {
    name: "Escalabilidad LATAM",
    description: "Diseñado para soportar millones de votos simultáneos",
    icon: <Globe className="h-6 w-6 stroke-indigo-400" />,
    href: DocsUrl,
    accent: "from-indigo-400 to-blue-500",
  },
];

export const testimonials = [
  {
    name: "Tu nombre aquí",
    role: "Tu cargo aquí",
    avatarSrc: "",
    socialUrl: "#",
    quote: "Agrega aquí el testimonio real de tu primer cliente o autoridad que valide ALIVIA.",
  },
  {
    name: "Tu nombre aquí",
    role: "Tu cargo aquí",
    avatarSrc: "",
    socialUrl: "#",
    quote: "Agrega aquí el testimonio real de tu primer cliente o autoridad que valide ALIVIA.",
  },
  {
    name: "Tu nombre aquí",
    role: "Tu cargo aquí",
    avatarSrc: "",
    socialUrl: "#",
    quote: "Agrega aquí el testimonio real de tu primer cliente o autoridad que valide ALIVIA.",
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

export interface ExampleItem {
  name: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}

export const examples: ExampleItem[] = [
  {
    name: "Elecciones Municipales",
    description: "Votación popular para alcaldes y concejales con verificación biométrica.",
    icon: <Globe className="h-7 w-7 stroke-amber-400" />,
    accent: "from-amber-400 to-orange-500",
  },
  {
    name: "Votaciones Gremiales",
    description: "Elecciones de juntas directivas en sindicatos y colegios profesionales.",
    icon: <Shield className="h-7 w-7 stroke-blue-400" />,
    accent: "from-blue-400 to-cyan-500",
  },
  {
    name: "Asambleas de Accionistas",
    description: "Votación corporativa con verificación de tenencia accionaria.",
    icon: <BarChart3 className="h-7 w-7 stroke-purple-400" />,
    accent: "from-purple-400 to-pink-500",
  },
  {
    name: "Presupuesto Participativo",
    description: "Decisión ciudadana sobre asignación de fondos públicos municipales.",
    icon: <ClipboardCheck className="h-7 w-7 stroke-green-400" />,
    accent: "from-green-400 to-emerald-500",
  },
  {
    name: "Referéndums Ciudadanos",
    description: "Consultas populares vinculantes con resultados auditables en tiempo real.",
    icon: <Search className="h-7 w-7 stroke-rose-400" />,
    accent: "from-rose-400 to-red-500",
  },
  {
    name: "Elecciones Universitarias",
    description: "Federaciones estudiantiles y centros académicos con alta participación móvil.",
    icon: <Brain className="h-7 w-7 stroke-indigo-400" />,
    accent: "from-indigo-400 to-violet-500",
  },
];
