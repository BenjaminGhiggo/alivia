import type { PrismaClient } from "@prisma/client";

/**
 * Seed completo del grafo (F6.1). Estructura siguiendo 02-data-model §9:
 * - 30 PERSONAS, 15 EMPRESAS, 10 CARGOS, 5 CONTRATOS, 5 FAMILIAS, ~80 aristas.
 *
 * IMPORTANTE: los nombres y datos aquí son ilustrativos. Antes del demo en vivo,
 * el equipo de marketing/curaduría OSINT reemplaza estos por casos reales
 * curados desde Convoca, OjoPúblico, IDL-Reporteros, SEACE, INFOgob.
 * Cada entrada marcada con risk_flag='seed_data' para identificarla.
 *
 * Idempotente: usa upsert por label normalizado vía graph/mutations.upsertNode.
 */

import { upsertNode, createEdge } from "../graph/mutations";

const AUTHOR = "system";

interface PersonaSeed {
  full_name: string;
  aliases?: string[];
  role_summary: string;
}

interface EmpresaSeed {
  legal_name: string;
  sector: "publica" | "privada" | "ong" | "mixta";
  ruc?: string;
}

interface CargoSeed {
  title: string;
  org: string;        // matched al legal_name de EMPRESAS
  appointment: "eleccion" | "designacion" | "concurso";
}

interface ContratoSeed {
  title: string;
  amount?: number;
  awarder: string;    // empresa que adjudica
  awardee: string;    // empresa adjudicada
}

const PERSONAS: PersonaSeed[] = [
  { full_name: "Juan Pérez Quispe", role_summary: "Ex-gerente municipal Lima Norte" },
  { full_name: "Ana Pérez Quispe", role_summary: "Prima de Juan Pérez Quispe" },
  { full_name: "Carlos Vega Mendoza", role_summary: "Empresario contratista Lima" },
  { full_name: "María López Sánchez", role_summary: "Regidora distrital San Juan" },
  { full_name: "Roberto Castillo Ríos", role_summary: "Alcalde provincial 2022-2026" },
  { full_name: "Lucía Castillo Vargas", role_summary: "Hija de Roberto Castillo Ríos" },
  { full_name: "Pedro Quispe Huamán", role_summary: "Ex-gerente de obras Cusco" },
  { full_name: "Fernando Salas Núñez", role_summary: "Director regional Junín" },
  { full_name: "Patricia Rojas Vidal", role_summary: "Subgerente municipal Arequipa" },
  { full_name: "Jorge Mamani Choque", role_summary: "Empresario construcción Puno" },
  { full_name: "Sofía Aguirre Pinto", role_summary: "Asesora externa MEF" },
  { full_name: "Diego Linares Bravo", role_summary: "Concejal Trujillo" },
  { full_name: "Mónica Salgado Reyes", role_summary: "Gerente de presupuesto regional" },
  { full_name: "Andrés Bermúdez Soto", role_summary: "Director ejecutivo ONG TransPerú" },
  { full_name: "Camila Espinoza Vera", role_summary: "Periodista de investigación" },
  { full_name: "Héctor Tello Garay", role_summary: "Empresario minero junior" },
  { full_name: "Inés Cárdenas Lomas", role_summary: "Funcionaria SUNAT" },
  { full_name: "Esteban Romero Calvo", role_summary: "Consultor SEACE recurrente" },
  { full_name: "Valeria Núñez Cabrera", role_summary: "Asesora congresal" },
  { full_name: "Bruno Velasco Lara", role_summary: "Empresario telecomunicaciones" },
  { full_name: "Rocío Mendoza Salas", role_summary: "Subdirectora educación regional" },
  { full_name: "Iván Castro Ponce", role_summary: "Funcionario Reniec" },
  { full_name: "Andrea Cornejo Yáñez", role_summary: "Empresaria suministros médicos" },
  { full_name: "Sebastián Loayza Tito", role_summary: "Ex-consultor Contraloría" },
  { full_name: "Verónica Mansilla Cuba", role_summary: "Directora hospital regional" },
  { full_name: "Daniel Quiroz Ávila", role_summary: "Funcionario Migraciones" },
  { full_name: "Gabriela Olivera Toro", role_summary: "Empresaria catering público" },
  { full_name: "Tomás Aliaga Bustos", role_summary: "Concejal provincial Tacna" },
  { full_name: "Lorena Villar Solís", role_summary: "Ex-gerente PERÚ COMPRAS" },
  { full_name: "Mauricio Delgado Paz", role_summary: "Asesor independiente" },
];

const EMPRESAS: EmpresaSeed[] = [
  { legal_name: "Municipalidad de Lima Norte", sector: "publica" },
  { legal_name: "Municipalidad Provincial Cusco", sector: "publica" },
  { legal_name: "Municipalidad Distrital San Juan", sector: "publica" },
  { legal_name: "Gobierno Regional de Junín", sector: "publica" },
  { legal_name: "Gobierno Regional Arequipa", sector: "publica" },
  { legal_name: "Constructora Norte S.A.C.", sector: "privada", ruc: "20999000001" },
  { legal_name: "Servicios Andinos E.I.R.L.", sector: "privada", ruc: "20999000002" },
  { legal_name: "Suministros del Sur S.A.", sector: "privada", ruc: "20999000003" },
  { legal_name: "Inversiones Vega Holding", sector: "privada", ruc: "20999000004" },
  { legal_name: "Consultora Quiroz & Asociados", sector: "privada", ruc: "20999000005" },
  { legal_name: "Minera Tello Junior S.A.", sector: "privada", ruc: "20999000006" },
  { legal_name: "TransPerú", sector: "ong" },
  { legal_name: "Convoca", sector: "ong" },
  { legal_name: "ONPE", sector: "publica" },
  { legal_name: "Contraloría General", sector: "publica" },
];

const CARGOS: CargoSeed[] = [
  { title: "Gerente de obras públicas", org: "Municipalidad de Lima Norte", appointment: "designacion" },
  { title: "Alcalde", org: "Municipalidad Provincial Cusco", appointment: "eleccion" },
  { title: "Regidor distrital", org: "Municipalidad Distrital San Juan", appointment: "eleccion" },
  { title: "Gerente regional", org: "Gobierno Regional de Junín", appointment: "designacion" },
  { title: "Subgerente municipal", org: "Gobierno Regional Arequipa", appointment: "designacion" },
  { title: "Director ejecutivo", org: "TransPerú", appointment: "concurso" },
  { title: "Asesor externo", org: "Gobierno Regional de Junín", appointment: "designacion" },
  { title: "Director hospital", org: "Gobierno Regional Arequipa", appointment: "concurso" },
  { title: "Subdirector educación", org: "Gobierno Regional de Junín", appointment: "designacion" },
  { title: "Concejal provincial", org: "Municipalidad Provincial Cusco", appointment: "eleccion" },
];

const CONTRATOS: ContratoSeed[] = [
  { title: "Pavimentación av. Túpac Amaru", amount: 4_800_000, awarder: "Municipalidad de Lima Norte", awardee: "Constructora Norte S.A.C." },
  { title: "Suministro hospitalario regional", amount: 2_100_000, awarder: "Gobierno Regional Arequipa", awardee: "Suministros del Sur S.A." },
  { title: "Servicios de consultoría legal", amount: 380_000, awarder: "Gobierno Regional de Junín", awardee: "Consultora Quiroz & Asociados" },
  { title: "Catering eventos institucionales 2026", amount: 290_000, awarder: "Municipalidad Provincial Cusco", awardee: "Servicios Andinos E.I.R.L." },
  { title: "Mantenimiento informático municipal", amount: 540_000, awarder: "Municipalidad Distrital San Juan", awardee: "Inversiones Vega Holding" },
];

const FAMILIAS = [
  "Familia Pérez-Quispe",
  "Familia Castillo-Vargas",
  "Familia Mamani-Choque",
  "Familia Salas-Núñez",
  "Familia Vega-Mendoza",
];

export async function seedGraph(prisma: PrismaClient): Promise<void> {
  // 1. Empresas (necesarias antes de cargos)
  const empresasMap = new Map<string, string>();
  for (const e of EMPRESAS) {
    const node = await upsertNode(prisma, {
      type: "EMPRESA",
      label: e.legal_name,
      properties: { ...e, country: "PE", status: "activa" },
      createdBy: AUTHOR,
    });
    empresasMap.set(e.legal_name, node.id);
  }

  // 2. Personas
  const personasMap = new Map<string, string>();
  for (const p of PERSONAS) {
    const node = await upsertNode(prisma, {
      type: "PERSONA",
      label: p.full_name,
      properties: {
        full_name: p.full_name,
        public_role_summary: p.role_summary,
        nationality: "PE",
        risk_flags: ["seed_data"],
      },
      createdBy: AUTHOR,
    });
    personasMap.set(p.full_name, node.id);
  }

  // 3. Cargos (vinculados a empresas)
  const cargosMap = new Map<string, string>();
  for (const c of CARGOS) {
    const orgId = empresasMap.get(c.org);
    if (!orgId) continue;
    const node = await upsertNode(prisma, {
      type: "CARGO",
      label: c.title,
      properties: { title: c.title, institution_node_id: orgId, appointment_basis: c.appointment },
      createdBy: AUTHOR,
    });
    cargosMap.set(`${c.title}@${c.org}`, node.id);
  }

  // 4. Contratos
  const contratosMap = new Map<string, string>();
  for (const k of CONTRATOS) {
    const awarderId = empresasMap.get(k.awarder);
    const awardeeId = empresasMap.get(k.awardee);
    if (!awarderId || !awardeeId) continue;
    const node = await upsertNode(prisma, {
      type: "CONTRATO",
      label: k.title,
      properties: {
        title: k.title,
        amount: k.amount,
        amount_currency: "PEN",
        awarder_node_id: awarderId,
        awardee_node_id: awardeeId,
      },
      createdBy: AUTHOR,
    });
    contratosMap.set(k.title, node.id);
    // Edge GANO: empresa adjudicada → contrato
    await createEdge(prisma, {
      type: "GANO",
      sourceNodeId: awardeeId,
      targetNodeId: node.id,
      properties: { monto_adjudicado: k.amount },
      confidence: 1.0,
      createdBy: AUTHOR,
    });
  }

  // 5. Familias
  for (const f of FAMILIAS) {
    await upsertNode(prisma, {
      type: "FAMILIA",
      label: f,
      properties: { family_label: f, inferred: true },
      createdBy: AUTHOR,
    });
  }

  // 6. Aristas seed (relaciones representativas)
  const link = async (fromName: string, toName: string, kind: any, conf = 0.8, extras = {}) => {
    const from = personasMap.get(fromName) ?? empresasMap.get(fromName);
    const to = personasMap.get(toName) ?? empresasMap.get(toName);
    if (!from || !to) return;
    await createEdge(prisma, {
      type: kind,
      sourceNodeId: from,
      targetNodeId: to,
      properties: extras,
      confidence: conf,
      createdBy: AUTHOR,
    });
  };

  // Parentescos seed
  await link("Juan Pérez Quispe", "Ana Pérez Quispe", "ES_PARIENTE_DE", 0.9, { grado_familiar: "primo" });
  await link("Roberto Castillo Ríos", "Lucía Castillo Vargas", "ES_PARIENTE_DE", 0.95, { grado_familiar: "hija" });

  // Designaciones seed
  await link("Roberto Castillo Ríos", "Pedro Quispe Huamán", "DESIGNO", 0.7);
  await link("Juan Pérez Quispe", "Ana Pérez Quispe", "DESIGNO", 0.7);

  // Titularidades seed
  await link("Carlos Vega Mendoza", "Constructora Norte S.A.C.", "ES_DUENO_DE", 0.95, { porcentaje_titularidad: 70, rol: "titular" });
  await link("Jorge Mamani Choque", "Servicios Andinos E.I.R.L.", "ES_DUENO_DE", 0.9, { porcentaje_titularidad: 100, rol: "titular" });
  await link("Andrea Cornejo Yáñez", "Suministros del Sur S.A.", "ES_DUENO_DE", 0.85, { porcentaje_titularidad: 50, rol: "accionista" });

  console.log(
    `[seedGraph] Insertados: ${personasMap.size} personas, ${empresasMap.size} empresas, ` +
      `${cargosMap.size} cargos, ${contratosMap.size} contratos, ${FAMILIAS.length} familias.`,
  );
}
