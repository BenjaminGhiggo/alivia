import { describe, expect, it } from "vitest";
import {
  computeCorroborationScore,
  isHighlighted,
  isPublishable,
  SCORE_THRESHOLDS,
} from "./_score";

/**
 * Tests demo-critical de F2.7. Fórmula y umbrales: 01-agent-behavior §7.
 */
describe("computeCorroborationScore", () => {
  const empty = {
    hasVerifiableLink: false,
    hasFormalReference: false,
    hasNameRoleMatch: false,
    additionalMatches: 0,
    independentReports: 0,
  };

  it("aporte sin nada → 0.00 (watchlist)", () => {
    expect(computeCorroborationScore(empty)).toBe(0);
  });

  it("solo link verificable → 0.30", () => {
    expect(computeCorroborationScore({ ...empty, hasVerifiableLink: true })).toBeCloseTo(0.3);
  });

  it("solo referencia formal (RUC/expediente) → 0.25", () => {
    expect(computeCorroborationScore({ ...empty, hasFormalReference: true })).toBeCloseTo(0.25);
  });

  it("solo nombre+cargo match → 0.20 (por sí solo NO publica)", () => {
    const score = computeCorroborationScore({ ...empty, hasNameRoleMatch: true });
    expect(score).toBeCloseTo(0.2);
    expect(isPublishable(score)).toBe(false);
  });

  it("link + name match → 0.50 (publica)", () => {
    const score = computeCorroborationScore({
      ...empty,
      hasVerifiableLink: true,
      hasNameRoleMatch: true,
    });
    expect(score).toBeCloseTo(0.5);
    expect(isPublishable(score)).toBe(true);
    expect(isHighlighted(score)).toBe(false);
  });

  it("coincidencias adicionales se capean en +0.30 (no en +0.45)", () => {
    const three = computeCorroborationScore({ ...empty, additionalMatches: 3 });
    // 3 × 0.15 = 0.45, pero cap es 0.30
    expect(three).toBeCloseTo(0.3);

    const two = computeCorroborationScore({ ...empty, additionalMatches: 2 });
    expect(two).toBeCloseTo(0.3);

    const one = computeCorroborationScore({ ...empty, additionalMatches: 1 });
    expect(one).toBeCloseTo(0.15);
  });

  it("aportes independientes se capean en +0.30", () => {
    const five = computeCorroborationScore({ ...empty, independentReports: 5 });
    // 5 × 0.10 = 0.50, cap 0.30
    expect(five).toBeCloseTo(0.3);

    const two = computeCorroborationScore({ ...empty, independentReports: 2 });
    expect(two).toBeCloseTo(0.2);
  });

  it("aporte fuerte → 1.0 (capeado en max)", () => {
    const all = computeCorroborationScore({
      hasVerifiableLink: true,
      hasFormalReference: true,
      hasNameRoleMatch: true,
      additionalMatches: 5,
      independentReports: 5,
    });
    // 0.30 + 0.25 + 0.20 + 0.30 (cap) + 0.30 (cap) = 1.35 → 1.00
    expect(all).toBe(1.0);
  });

  it("aporte borderline al umbral publish (0.40)", () => {
    const exactly = computeCorroborationScore({
      ...empty,
      hasVerifiableLink: true,
      additionalMatches: 1,
    });
    // 0.30 + 0.15 = 0.45 ≥ 0.40
    expect(isPublishable(exactly)).toBe(true);

    const justBelow = computeCorroborationScore({
      ...empty,
      hasFormalReference: true,
    });
    // 0.25 < 0.40
    expect(isPublishable(justBelow)).toBe(false);
  });

  it("aporte alcanza highlight (0.70) con link + ref + name", () => {
    const score = computeCorroborationScore({
      ...empty,
      hasVerifiableLink: true,
      hasFormalReference: true,
      hasNameRoleMatch: true,
    });
    // 0.30 + 0.25 + 0.20 = 0.75 ≥ 0.70
    expect(isHighlighted(score)).toBe(true);
  });

  it("valores negativos se ignoran (defensa contra inputs basura)", () => {
    const neg = computeCorroborationScore({
      ...empty,
      additionalMatches: -3,
      independentReports: -1,
    });
    expect(neg).toBe(0);
  });
});

describe("SCORE_THRESHOLDS", () => {
  it("umbrales coinciden con 01-agent-behavior §7", () => {
    expect(SCORE_THRESHOLDS.publish).toBe(0.40);
    expect(SCORE_THRESHOLDS.highlight).toBe(0.70);
    expect(SCORE_THRESHOLDS.max).toBe(1.0);
  });
});
