/**
 * Subida de metadata NFT a IPFS via web3.storage.
 * Spec: 05-architecture §3.7 + 04-nfts §3.5.
 *
 * Fail-soft: si WEB3_STORAGE_TOKEN falta, devuelve un data: URI inline (válido
 * para tokenURI, no requiere chain externa). El demo sigue siendo demoable sin
 * IPFS real.
 */

export interface ActaMetadata {
  caseId: string;
  caseType: string;
  subjectName: string;
  evidenceHash: string;
  reporterPseudonym: string;
  corroborationScore: number;
  createdAt: string;
}

export function buildActaMetadata(input: ActaMetadata): object {
  return {
    name: `Alivia · Acta del Caso ${input.caseId}`,
    description: `Señalamiento ciudadano (${input.caseType}) registrado por ${input.reporterPseudonym}. Memoria pública verificable en zkSYS Testnet.`,
    image: "https://alivia.sbs/nft/acta-cover.png",
    external_url: `https://alivia.sbs/casos/${input.caseId}`,
    attributes: [
      { trait_type: "Tipo de caso", value: input.caseType },
      { trait_type: "Fecha", value: input.createdAt.slice(0, 10) },
      { trait_type: "Score de corroboración", value: input.corroborationScore },
      { trait_type: "Sujeto señalado", value: input.subjectName },
      { trait_type: "País", value: "PE" },
    ],
    evidence_hash: input.evidenceHash,
  };
}

export interface IpfsService {
  uploadMetadata(metadata: object): Promise<string>; // devuelve URI (ipfs://... o data:...)
}

class Web3StorageService implements IpfsService {
  constructor(private readonly token: string) {}

  async uploadMetadata(metadata: object): Promise<string> {
    const blob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
    const formData = new FormData();
    formData.append("file", blob, "acta.json");

    const res = await fetch("https://api.web3.storage/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}` },
      body: formData as unknown as BodyInit,
    });

    if (!res.ok) {
      throw new Error(`web3.storage upload failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as { cid: string };
    return `ipfs://${data.cid}/acta.json`;
  }
}

class DataUriIpfsService implements IpfsService {
  async uploadMetadata(metadata: object): Promise<string> {
    const json = JSON.stringify(metadata);
    const base64 = Buffer.from(json).toString("base64");
    console.warn("[ipfs:mock] sin WEB3_STORAGE_TOKEN, devolviendo data: URI inline.");
    return `data:application/json;base64,${base64}`;
  }
}

let cached: IpfsService | null = null;
export function getIpfsService(): IpfsService {
  if (cached) return cached;
  const token = process.env.WEB3_STORAGE_TOKEN;
  cached = token ? new Web3StorageService(token) : new DataUriIpfsService();
  return cached;
}
