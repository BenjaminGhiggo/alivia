/**
 * Cálculo del corroboration_score del aporte.
 * Fuente: docs/specs/01-agent-behavior.md §7.
 *
 * Demo-critical (07.F2.7): el umbral 0.40 decide si un aporte se publica y
 * mintea NFT. Un bug acá rompe el momento "wow" del demo o publica basura.
 */

export interface ScoreFactors {
  /** Hay al menos un link verificable (no roto, no privado). */
  hasVerifiableLink: boolean;
  /** Hay número de expediente, RUC, resolución, etc. */
  hasFormalReference: boolean;
  /** Match exacto de nombre + cargo con nodo previo. */
  hasNameRoleMatch: boolean;
  /** Cantidad de coincidencias adicionales (empresa, vínculo familiar). Cap interno: 2. */
  additionalMatches: number;
  /** Cantidad de aportes ciudadanos independientes previos sobre el mismo sujeto. Cap interno: 3. */
  independentReports: number;
}

const WEIGHTS = {
  verifiableLink: 0.30,
  formalReference: 0.25,
  nameRoleMatch: 0.20,
  additionalMatchUnit: 0.15,
  additionalMatchCap: 0.30,
  independentReportUnit: 0.10,
  independentReportCap: 0.30,
};

export const SCORE_THRESHOLDS = {
  /** Mínimo para publicar y mintear NFT-Acta. */
  publish: 0.40,
  /** Alerta destacada en el grafo. */
  highlight: 0.70,
  /** Tope superior. */
  max: 1.0,
};

export function computeCorroborationScore(f: ScoreFactors): number {
  let score = 0;

  if (f.hasVerifiableLink) score += WEIGHTS.verifiableLink;
  if (f.hasFormalReference) score += WEIGHTS.formalReference;
  if (f.hasNameRoleMatch) score += WEIGHTS.nameRoleMatch;

  const additional = Math.max(0, f.additionalMatches) * WEIGHTS.additionalMatchUnit;
  score += Math.min(additional, WEIGHTS.additionalMatchCap);

  const independent = Math.max(0, f.independentReports) * WEIGHTS.independentReportUnit;
  score += Math.min(independent, WEIGHTS.independentReportCap);

  return Math.min(score, SCORE_THRESHOLDS.max);
}

export function isPublishable(score: number): boolean {
  return score >= SCORE_THRESHOLDS.publish;
}

export function isHighlighted(score: number): boolean {
  return score >= SCORE_THRESHOLDS.highlight;
}
