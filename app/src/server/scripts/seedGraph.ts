import type { PrismaClient } from "@prisma/client";

/**
 * Seed mínimo del grafo de Alivia (F1.5 del checklist).
 * ~10 nodos para que el agente y la vista web tengan algo contra qué probar.
 * Seed full (30+ personas, OSINT real curado) entra en F6.
 *
 * Spec: docs/specs/02-data-model.md §9
 *
 * Datos ficticios pero estructuralmente realistas: nombres tomados del ejemplo
 * del spec ("Juan Pérez Quispe"). NO usar este seed en producción.
 *
 * Registrado en main.wasp como: seeds: [..., seedGraph].
 * Correr con: wasp db seed seedGraph
 */
export async function seedGraph(prismaClient: PrismaClient): Promise<void> {
  const seedAuthor = "system";

  // --- NODOS ---

  const personas = await Promise.all(
    PERSONAS_SEED.map((p) =>
      prismaClient.node.create({
        data: {
          type: "PERSONA",
          label: p.full_name,
          properties: p,
          createdBy: seedAuthor,
        },
      }),
    ),
  );

  const empresas = await Promise.all(
    EMPRESAS_SEED.map((e) =>
      prismaClient.node.create({
        data: {
          type: "EMPRESA",
          label: e.legal_name,
          properties: e,
          createdBy: seedAuthor,
        },
      }),
    ),
  );

  const cargos = await Promise.all(
    CARGOS_SEED.map((c, i) =>
      prismaClient.node.create({
        data: {
          type: "CARGO",
          label: c.title,
          // Asocia el cargo al primer empresa-nodo (estructural; data real en F6)
          properties: { ...c, institution_node_id: empresas[i % empresas.length].id },
          createdBy: seedAuthor,
        },
      }),
    ),
  );

  const familia = await prismaClient.node.create({
    data: {
      type: "FAMILIA",
      label: "Familia Pérez-Quispe",
      properties: {
        family_label: "Familia Pérez-Quispe",
        inferred: true,
        evidence_node_ids: [],
      },
      createdBy: seedAuthor,
    },
  });

  // --- ARISTAS (mínimas, ilustran los 7 tipos de EdgeType) ---

  const [persona0, persona1, persona2] = personas;
  const [empresa0] = empresas;
  const [cargo0] = cargos;

  await prismaClient.edge.createMany({
    data: [
      {
        type: "OCUPA_CARGO",
        sourceNodeId: persona0.id,
        targetNodeId: cargo0.id,
        properties: {},
        confidence: 0.95,
        createdBy: seedAuthor,
      },
      {
        type: "ES_PARIENTE_DE",
        sourceNodeId: persona0.id,
        targetNodeId: persona1.id,
        properties: { grado_familiar: "primo", confirmado: true },
        confidence: 0.85,
        createdBy: seedAuthor,
      },
      {
        type: "ES_DUENO_DE",
        sourceNodeId: persona2.id,
        targetNodeId: empresa0.id,
        properties: { porcentaje_titularidad: 60, rol: "titular" },
        confidence: 0.90,
        createdBy: seedAuthor,
      },
      {
        type: "DESIGNO",
        sourceNodeId: persona0.id,
        targetNodeId: persona1.id,
        properties: { via_cargo_id: cargo0.id, fecha_designacion: "2026-03-15" },
        confidence: 0.70,
        createdBy: seedAuthor,
      },
    ],
  });

  console.log(
    `[seedGraph] Insertados: ${personas.length} personas, ${empresas.length} empresas, ` +
      `${cargos.length} cargos, 1 familia, 4 aristas.`,
  );
}

// =============================================================================
// Datos seed (ficticios; estructura tomada de 02-data-model §2)
// =============================================================================

const PERSONAS_SEED = [
  {
    full_name: "Juan Pérez Quispe",
    aliases: ["J. Pérez"],
    nationality: "PE",
    public_role_summary: "Ejemplo de gerente de obras (seed dev)",
    risk_flags: ["seed_data"],
  },
  {
    full_name: "Ana Pérez Quispe",
    aliases: [],
    nationality: "PE",
    public_role_summary: "Familiar de Juan Pérez Quispe (seed dev)",
    risk_flags: ["seed_data"],
  },
  {
    full_name: "Carlos Vega Mendoza",
    aliases: [],
    nationality: "PE",
    public_role_summary: "Empresario contratista (seed dev)",
    risk_flags: ["seed_data"],
  },
  {
    full_name: "María López Sánchez",
    aliases: ["M. López"],
    nationality: "PE",
    public_role_summary: "Ejemplo de regidora distrital (seed dev)",
    risk_flags: ["seed_data"],
  },
];

const EMPRESAS_SEED = [
  {
    legal_name: "Constructora Norte S.A.C.",
    aliases: ["Constructora Norte"],
    ruc: "20999000001",
    sector: "privada",
    country: "PE",
    status: "activa",
  },
  {
    legal_name: "Municipalidad de Ejemplo Norte",
    aliases: [],
    sector: "publica",
    country: "PE",
    status: "activa",
  },
];

const CARGOS_SEED = [
  {
    title: "Gerente de obras públicas",
    appointment_basis: "designacion",
  },
  {
    title: "Regidora distrital",
    appointment_basis: "eleccion",
  },
];
