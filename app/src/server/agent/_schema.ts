import { z } from "zod";

/**
 * Esquema Zod del aporte ciudadano (Case) que el agente produce al cerrar
 * una entrevista. Fuente de verdad: docs/specs/01-agent-behavior.md §6.
 *
 * Demo-critical (07.F2.8): si este schema cambia, hay riesgo de invalidar
 * NFT-Actas ya minteadas. Bump major en el versionado (01 §12) antes.
 */

export const CaseType = z.enum(["nepotismo", "licitacion", "electoral", "otro"]);
export type CaseType = z.infer<typeof CaseType>;

export const CaseStatus = z.enum(["watchlist", "published", "archived", "refuted"]);
export type CaseStatus = z.infer<typeof CaseStatus>;

export const EvidenceItem = z.object({
  type: z.enum(["link", "image", "document_reference", "expediente", "audio", "video"]),
  value: z.string().min(1),
});
export type EvidenceItem = z.infer<typeof EvidenceItem>;

export const GraphConnection = z.object({
  node_id: z.string().min(1),
  relation: z.string().min(1),
  confidence: z.number().min(0).max(1),
});
export type GraphConnection = z.infer<typeof GraphConnection>;

export const CaseSubject = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
  institution: z.string().optional(),
});
export type CaseSubject = z.infer<typeof CaseSubject>;

/**
 * id formato: alv-YYYY-MM-DD-NNNN.
 */
const CASE_ID_REGEX = /^alv-\d{4}-\d{2}-\d{2}-\d{4}$/;

export const AporteCase = z.object({
  case_id: z.string().regex(CASE_ID_REGEX, "Formato esperado: alv-YYYY-MM-DD-NNNN"),
  case_type: CaseType,
  subject: CaseSubject,
  facts: z.array(z.string().min(1)).min(1, "Al menos un hecho (R1)"),
  evidence: z.array(EvidenceItem),
  graph_connections: z.array(GraphConnection),
  corroboration_score: z.number().min(0).max(1),
  reporter_pseudonym: z.string().regex(/^aportante-[a-z0-9]{4,}$/, "Pseudónimo aportante-XXXX"),
  language_review_passed: z.boolean(),
  created_at: z.string().datetime({ offset: true }),
  evidence_hash: z.string().regex(/^0x[a-fA-F0-9]+$/, "Hash 0x-prefixed hex"),
  nft_token_id: z.string().nullable(),
});
export type AporteCase = z.infer<typeof AporteCase>;

/**
 * Genera un case_id determinístico desde una fecha y un secuencial.
 * Ejemplo: nextCaseId(new Date('2026-06-04'), 1) → "alv-2026-06-04-0001"
 */
export function nextCaseId(date: Date, sequenceN: number): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const seq = String(sequenceN).padStart(4, "0");
  return `alv-${yyyy}-${mm}-${dd}-${seq}`;
}
