import { ContactUrl, DocsUrl, PrivacyUrl, TermsUrl } from "../shared/common";
import {
  MessageCircle, Network, FileCheck, Eye, Shield,
  Search, Award, ClipboardCheck, Globe,
} from "lucide-react";
import CrystalIcon from "./CrystalIcon";
import type { FAQ } from "./components/FAQ";

export interface FeatureItem {
  name: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  accent: string;
}

const iconColors: Record<string, string> = {
  cyan: "#00d2ff",
  purple: "#a855f7",
  amber: "#f59e0b",
  emerald: "#34d399",
  sky: "#00d2ff",
  red: "#f472b6",
  violet: "#a855f7",
  lime: "#34d399",
  indigo: "#818cf8",
};

export const features: FeatureItem[] = [
  {
    name: "Agente IA conversacional",
    description: "Habla con Alivia en Telegram o Discord. Te entrevista, estructura lo que viste y lo conecta al grafo.",
    icon: <CrystalIcon color={iconColors.cyan}><MessageCircle className="h-6 w-6 stroke-[var(--color-glow)]" /></CrystalIcon>,
    href: DocsUrl,
    accent: "from-cyan-400 to-blue-500",
  },
  {
    name: "Grafo público de vínculos",
    description: "Mapa vivo de personas, cargos, empresas, contratos y parentescos. Crece con cada aporte ciudadano.",
    icon: <CrystalIcon color={iconColors.purple}><Network className="h-6 w-6 stroke-[var(--color-glow)]" /></CrystalIcon>,
    href: DocsUrl,
    accent: "from-purple-400 to-pink-500",
  },
  {
    name: "NFT-Acta en Syscoin",
    description: "Cada caso cerrado se sella como transacción inmutable en Syscoin Tanenbaum. Citable por cualquiera.",
    icon: <CrystalIcon color={iconColors.amber}><FileCheck className="h-6 w-6 stroke-[var(--color-glow)]" /></CrystalIcon>,
    href: DocsUrl,
    accent: "from-amber-400 to-orange-500",
  },
  {
    name: "Anonimato seudónimo",
    description: "No pedimos nombre real, no almacenamos PII. Tu identidad no se vende ni se expone.",
    icon: <CrystalIcon color={iconColors.emerald}><Eye className="h-6 w-6 stroke-[var(--color-glow)]" /></CrystalIcon>,
    href: DocsUrl,
    accent: "from-emerald-400 to-teal-500",
  },
  {
    name: "Score de corroboración",
    description: "Cada señalamiento tiene un peso según fuentes, evidencia y vínculos detectados. Transparente y auditable.",
    icon: <CrystalIcon color={iconColors.sky}><Shield className="h-6 w-6 stroke-[var(--color-glow)]" /></CrystalIcon>,
    href: DocsUrl,
    accent: "from-sky-400 to-cyan-500",
  },
  {
    name: "Reglas R1–R10",
    description: "Diez reglas operativas gobiernan cómo Alivia recibe, filtra, estructura y publica cada aporte. Sin excepción.",
    icon: <CrystalIcon color={iconColors.red}><ClipboardCheck className="h-6 w-6 stroke-[var(--color-glow)]" /></CrystalIcon>,
    href: DocsUrl,
    accent: "from-red-400 to-rose-500",
  },
  {
    name: "Cazarrecompensas",
    description: "ONGs y ciudadanos bloquean TSYS como recompensa por evidencia específica. Investigadores cobran al aportar.",
    icon: <CrystalIcon color={iconColors.violet}><Award className="h-6 w-6 stroke-[var(--color-glow)]" /></CrystalIcon>,
    href: DocsUrl,
    accent: "from-violet-400 to-purple-500",
  },
  {
    name: "Consulta en lenguaje natural",
    description: "Pregunta '¿quién es X?' y Alivia te devuelve un dossier con sus vínculos, cargos y señalamientos.",
    icon: <CrystalIcon color={iconColors.lime}><Search className="h-6 w-6 stroke-[var(--color-glow)]" /></CrystalIcon>,
    href: DocsUrl,
    accent: "from-lime-400 to-green-500",
  },
  {
    name: "Cobertura LatAm",
    description: "Inteligencia ciudadana donde Sayari y OpenCorporates no llegan. Construida desde la región para la región.",
    icon: <CrystalIcon color={iconColors.indigo}><Globe className="h-6 w-6 stroke-[var(--color-glow)]" /></CrystalIcon>,
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
    quote: "Agrega aquí el testimonio real de tu primer validador o autoridad que respalde a ALIVIA.",
  },
  {
    name: "Tu nombre aquí",
    role: "Tu cargo aquí",
    avatarSrc: "",
    socialUrl: "#",
    quote: "Agrega aquí el testimonio real de tu primer validador o autoridad que respalde a ALIVIA.",
  },
  {
    name: "Tu nombre aquí",
    role: "Tu cargo aquí",
    avatarSrc: "",
    socialUrl: "#",
    quote: "Agrega aquí el testimonio real de tu primer validador o autoridad que respalde a ALIVIA.",
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
    question: "¿Cómo garantiza Alivia que mi aporte no se pierda?",
    answer: "Cada caso cerrado se registra como un NFT-Acta en Syscoin Tanenbaum testnet. Una vez minteado, nadie —ni siquiera nosotros— puede modificarlo o eliminarlo. Cualquier persona puede consultar el caso citando el hash de la transacción.",
  },
  {
    id: 2,
    question: "¿Qué es Syscoin y por qué se usa como blockchain?",
    answer: "Syscoin es una blockchain de capa 1 que combina la seguridad del merge-mining con Bitcoin con contratos inteligentes compatibles con Ethereum (NEVM). Ofrece transacciones de bajo costo (< $0.01 USD), confirmación en segundos y la robustez de una red consolidada. Ideal para sellar señalamientos ciudadanos sin barreras de entrada.",
  },
  {
    id: 3,
    question: "¿Cómo funciona el anonimato?",
    answer: "Alivia es seudónima por defecto. No pedimos nombre real, no almacenamos datos biométricos ni documentos de identidad. Tu aporte se publica con un identificador único (ej. aportante-a4f2). Solo tú sabes que ese aporte es tuyo. Así protegemos a quienes aportan en contextos de riesgo.",
  },
  {
    id: 4,
    question: "¿Qué es el score de corroboración?",
    answer: "Es un peso que Alivia asigna a cada señalamiento según la cantidad y calidad de evidencia, el número de fuentes que lo respaldan y los vínculos detectados con otros casos. El score no es un veredicto — es una señal de qué tan documentado está un señalamiento. Siempre es transparente y auditabled.",
    href: DocsUrl,
  },
  {
    id: 5,
    question: "¿Cómo puedo consultar el grafo?",
    answer: "Puedes preguntarle directamente a Alivia en Telegram (@alivia_sbs_bot) con frases como '¿quién es X?' o '¿qué sabes de Y?'. También puedes explorar el grafo visualmente en alivia.sbs/grafo, donde cada nodo es una persona, cargo o empresa, y cada arista es un vínculo documentado.",
  },
  {
    id: 6,
    question: "¿Qué pasa si alguien pone información falsa?",
    answer: "Alivia filtra lenguaje difamatorio y exige hechos específicos (fechas, nombres, evidencia) antes de publicar. Si un señalamiento se prueba falso, se corrige — pero la corrección no borra, deja huella. Toda actualización queda timestampeada en blockchain. El sistema está diseñado para que la verdad siempre pueda aparecer junto a lo que la precedió.",
  },
  {
    id: 7,
    question: "¿Alivia reemplaza a la fiscalía o a los tribunales?",
    answer: "No. Alivia no emite veredictos, no promete consecuencias judiciales, no reemplaza al sistema de justicia. Alivia es memoria pública: conecta pistas, las estructura, las sella en blockchain. La verificación final y la acción legal son competencia de medios, autoridades y tribunales.",
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
    name: "Nepotismo en contrataciones",
    description: "Un ciudadano reporta que un familiar directo de un alcalde ganó una licitación. Alivia conecta los nombres, cargos y empresas en el grafo.",
    icon: <Globe className="h-7 w-7 stroke-amber-400" />,
    accent: "from-amber-400 to-orange-500",
  },
  {
    name: "Licitaciones amañadas",
    description: "Alivia detecta que una misma empresa ganó contratos en municipios distintos con montos sospechosamente similares. Alerta a la comunidad.",
    icon: <Shield className="h-7 w-7 stroke-blue-400" />,
    accent: "from-blue-400 to-cyan-500",
  },
  {
    name: "Observatorio electoral",
    description: "Ciudadanos suben fotos de actas electorales. Alivia cruza los datos con resultados oficiales y marca discrepancias visibles.",
    icon: <Search className="h-7 w-7 stroke-purple-400" />,
    accent: "from-purple-400 to-pink-500",
  },
  {
    name: "Cazarrecompensas",
    description: "Una ONG bloquea TSYS como bounty por evidencia de un caso específico. Investigadores aportan documentos, reclaman la recompensa.",
    icon: <Award className="h-7 w-7 stroke-green-400" />,
    accent: "from-green-400 to-emerald-500",
  },
  {
    name: "Compliance y due diligence",
    description: "Un banco consulta el grafo antes de aprobar una operación. Encuentra señalamientos que ninguna base tradicional tenía.",
    icon: <FileCheck className="h-7 w-7 stroke-rose-400" />,
    accent: "from-rose-400 to-red-500",
  },
  {
    name: "Antecedentes de candidatos",
    description: "Antes de las elecciones, un ciudadano pregunta '¿quién es este candidato?' y recibe un dossier con vínculos, cargos previos y señalamientos.",
    icon: <MessageCircle className="h-7 w-7 stroke-indigo-400" />,
    accent: "from-indigo-400 to-violet-500",
  },
];
