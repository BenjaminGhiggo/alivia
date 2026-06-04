import { describe, expect, it } from "vitest";
import { AporteCase, nextCaseId } from "./_schema";

/**
 * Tests demo-critical de F2.8. Schema fuente: 01-agent-behavior §6.
 * Validar que el JSON producido por el agente cumple el contrato antes de
 * persistir y hashear para NFT-Acta.
 */
describe("AporteCase schema", () => {
  const validCase = {
    case_id: "alv-2026-06-04-0001",
    case_type: "nepotismo",
    subject: {
      name: "Juan Pérez Quispe",
      role: "Gerente de obras públicas",
      institution: "Municipalidad de Lima Norte",
    },
    facts: ["Designación de [pariente] como gerente el 2026-03-15"],
    evidence: [{ type: "link", value: "https://convoca.pe/caso-123" }],
    graph_connections: [
      { node_id: "node-1042", relation: "comparte_empresa_con", confidence: 0.78 },
    ],
    corroboration_score: 0.62,
    reporter_pseudonym: "aportante-7f3a",
    language_review_passed: true,
    created_at: "2026-06-04T15:21:00-05:00",
    evidence_hash: "0xabc123def456",
    nft_token_id: null,
  };

  it("acepta un aporte canónico válido", () => {
    expect(() => AporteCase.parse(validCase)).not.toThrow();
  });

  it("nft_token_id puede ser null antes del mint o string después", () => {
    expect(() => AporteCase.parse({ ...validCase, nft_token_id: null })).not.toThrow();
    expect(() => AporteCase.parse({ ...validCase, nft_token_id: "1" })).not.toThrow();
  });

  it("case_id rechaza formato inválido", () => {
    expect(() => AporteCase.parse({ ...validCase, case_id: "case-001" })).toThrow();
    expect(() => AporteCase.parse({ ...validCase, case_id: "alv-2026-6-4-1" })).toThrow();
    expect(() => AporteCase.parse({ ...validCase, case_id: "ALV-2026-06-04-0001" })).toThrow();
  });

  it("case_type sólo acepta los 4 valores oficiales", () => {
    expect(() => AporteCase.parse({ ...validCase, case_type: "corrupcion" })).toThrow();
    for (const t of ["nepotismo", "licitacion", "electoral", "otro"]) {
      expect(() => AporteCase.parse({ ...validCase, case_type: t })).not.toThrow();
    }
  });

  it("facts no puede estar vacío (R1)", () => {
    expect(() => AporteCase.parse({ ...validCase, facts: [] })).toThrow();
  });

  it("corroboration_score debe estar en [0, 1]", () => {
    expect(() => AporteCase.parse({ ...validCase, corroboration_score: -0.1 })).toThrow();
    expect(() => AporteCase.parse({ ...validCase, corroboration_score: 1.1 })).toThrow();
    expect(() => AporteCase.parse({ ...validCase, corroboration_score: 0 })).not.toThrow();
    expect(() => AporteCase.parse({ ...validCase, corroboration_score: 1 })).not.toThrow();
  });

  it("reporter_pseudonym debe matchear aportante-XXXX", () => {
    expect(() => AporteCase.parse({ ...validCase, reporter_pseudonym: "user-123" })).toThrow();
    expect(() => AporteCase.parse({ ...validCase, reporter_pseudonym: "juan" })).toThrow();
    expect(() => AporteCase.parse({ ...validCase, reporter_pseudonym: "aportante-abc" })).not.toThrow();
  });

  it("evidence_hash debe ser hex 0x-prefixed", () => {
    expect(() => AporteCase.parse({ ...validCase, evidence_hash: "abc123" })).toThrow();
    expect(() => AporteCase.parse({ ...validCase, evidence_hash: "0xZZ" })).toThrow();
    expect(() => AporteCase.parse({ ...validCase, evidence_hash: "0xabcDEF" })).not.toThrow();
  });

  it("created_at debe ser ISO datetime con offset", () => {
    expect(() => AporteCase.parse({ ...validCase, created_at: "2026-06-04" })).toThrow();
    expect(() => AporteCase.parse({ ...validCase, created_at: "ayer" })).toThrow();
    expect(() => AporteCase.parse({ ...validCase, created_at: "2026-06-04T15:21:00Z" })).not.toThrow();
  });

  it("evidence items sólo aceptan los 6 tipos oficiales", () => {
    expect(() =>
      AporteCase.parse({
        ...validCase,
        evidence: [{ type: "rumor", value: "x" }],
      }),
    ).toThrow();
    for (const t of ["link", "image", "document_reference", "expediente", "audio", "video"]) {
      expect(() =>
        AporteCase.parse({
          ...validCase,
          evidence: [{ type: t, value: "x" }],
        }),
      ).not.toThrow();
    }
  });

  it("graph_connection.confidence debe estar en [0, 1]", () => {
    expect(() =>
      AporteCase.parse({
        ...validCase,
        graph_connections: [{ node_id: "n", relation: "r", confidence: 1.5 }],
      }),
    ).toThrow();
  });
});

describe("nextCaseId", () => {
  it("formato esperado: alv-YYYY-MM-DD-NNNN con cero-padding", () => {
    expect(nextCaseId(new Date("2026-06-04T00:00:00Z"), 1)).toBe("alv-2026-06-04-0001");
    expect(nextCaseId(new Date("2026-06-04T00:00:00Z"), 42)).toBe("alv-2026-06-04-0042");
    expect(nextCaseId(new Date("2026-12-31T00:00:00Z"), 9999)).toBe("alv-2026-12-31-9999");
    expect(nextCaseId(new Date("2026-01-01T00:00:00Z"), 1)).toBe("alv-2026-01-01-0001");
  });

  it("ids generados pasan la validación del schema", () => {
    const id = nextCaseId(new Date("2026-06-04T00:00:00Z"), 1);
    expect(id).toMatch(/^alv-\d{4}-\d{2}-\d{2}-\d{4}$/);
  });
});
