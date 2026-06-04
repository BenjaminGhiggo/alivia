import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  formatEther,
  parseAbi,
  parseEther,
  parseGwei,
  type Address,
} from "viem";
import { registerBounty } from "wasp/client/operations";

/**
 * Página para crear un Bounty. El postor:
 * 1. Conecta su wallet (Pali o MetaMask).
 * 2. Llena el form (caso objetivo, descripción, monto TSYS, expiración).
 * 3. Firma openBounty(targetCaseId, expiresIn, tokenURI) con value=amount.
 * 4. Tras confirmación on-chain, backend persiste el bounty en DB.
 *
 * Spec: 04-nfts §5 + 03-use-cases caso 3.
 */

const BOUNTY_CONTRACT = (import.meta.env.VITE_BOUNTY_CONTRACT ??
  "0x0000000000000000000000000000000000000000") as Address;
const BOUNTY_ABI = parseAbi([
  "function openBounty(string targetCaseId, uint64 expiresIn, string tokenURI_) payable returns (uint256)",
  "event BountyOpened(uint256 indexed tokenId, address indexed postor, uint256 amount, string targetCaseId)",
]);

const tanenbaum = defineChain({
  id: 5700,
  name: "Syscoin Tanenbaum Testnet",
  nativeCurrency: { name: "tSYS", symbol: "tSYS", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.tanenbaum.io"] } },
});
const TANENBAUM_HEX = "0x1644";

export default function BountyNewPage() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<Address | null>(null);
  const [balance, setBalance] = useState<bigint>(0n);
  const [targetCaseId, setTargetCaseId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("10");
  const [days, setDays] = useState("30");
  const [postedBy, setPostedBy] = useState("aportante-0000");
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function connect() {
    const eth = (window as any).ethereum;
    if (!eth) {
      setStatus("No tienes wallet instalada (Pali Wallet o MetaMask).");
      return;
    }
    try {
      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      const current = (await eth.request({ method: "eth_chainId" })) as string;
      if (current !== TANENBAUM_HEX) {
        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: TANENBAUM_HEX }],
          });
        } catch (e: any) {
          if (e.code === 4902) {
            await eth.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: TANENBAUM_HEX,
                chainName: "Syscoin Tanenbaum Testnet",
                nativeCurrency: { name: "tSYS", symbol: "tSYS", decimals: 18 },
                rpcUrls: ["https://rpc.tanenbaum.io"],
                blockExplorerUrls: ["https://tanenbaum.io"],
              }],
            });
          } else throw e;
        }
      }
      setAccount(accounts[0] as Address);
      const pub = createPublicClient({ chain: tanenbaum, transport: custom(eth) });
      const bal = await pub.getBalance({ address: accounts[0] as Address });
      setBalance(bal);
    } catch (err: any) {
      setStatus(`Error al conectar: ${err?.message ?? err}`);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!account) {
      setStatus("Primero conecta tu wallet.");
      return;
    }
    if (!targetCaseId || !description) {
      setStatus("Llena los campos obligatorios.");
      return;
    }
    const amountWei = parseEther(amount);
    if (balance < amountWei) {
      setStatus("Balance insuficiente.");
      return;
    }

    setBusy(true);
    setStatus("Firmando openBounty en tu wallet...");
    try {
      const eth = (window as any).ethereum;
      const wallet = createWalletClient({ account, chain: tanenbaum, transport: custom(eth) });
      const pub = createPublicClient({ chain: tanenbaum, transport: custom(eth) });

      const tokenURI = `https://alivia.sbs/bounties/metadata.json`;
      const txHash = await wallet.writeContract({
        address: BOUNTY_CONTRACT,
        abi: BOUNTY_ABI,
        functionName: "openBounty",
        args: [targetCaseId, BigInt(parseInt(days, 10) * 86_400), tokenURI],
        value: amountWei,
        gas: 600_000n,
        gasPrice: parseGwei("100"),
      });
      setStatus(`Tx enviada: ${txHash}. Esperando confirmación on-chain...`);

      const receipt = await pub.waitForTransactionReceipt({ hash: txHash, timeout: 600_000 });
      if (receipt.status !== "success") throw new Error("Tx falló");
      const logs = await pub.getContractEvents({
        address: BOUNTY_CONTRACT,
        abi: BOUNTY_ABI,
        eventName: "BountyOpened",
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
      });
      const tokenId = logs[0]?.args.tokenId?.toString() ?? "0";

      setStatus(`Registrando bounty en Alivia...`);
      const bounty = await registerBounty({
        nftBountyTokenId: tokenId,
        targetCaseId,
        description,
        amountTsys: parseFloat(amount),
        claimCriteria: description,
        postedBy,
        expiresAt: new Date(Date.now() + parseInt(days, 10) * 86_400_000).toISOString(),
      });
      setStatus(`OK. Bounty creado #${tokenId}`);
      setTimeout(() => navigate("/bounties" as any), 1500);
    } catch (err: any) {
      setStatus(`Error: ${err?.shortMessage ?? err?.message ?? err}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Nuevo Bounty</h1>
      <p className="mb-6 mt-2 text-slate-600 dark:text-slate-400">
        Pone TSYS bloqueados como recompensa por evidencia específica. Cualquier investigador puede
        reclamarlo si cumple los criterios.
      </p>

      <div className="mb-6 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
        {account ? (
          <div className="text-sm">
            <div className="font-mono">Wallet: {account.slice(0, 10)}…{account.slice(-6)}</div>
            <div>Balance: {formatEther(balance)} tSYS</div>
          </div>
        ) : (
          <button
            onClick={connect}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Conectar wallet (Pali / MetaMask)
          </button>
        )}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Caso o nodo objetivo (id del Case o nodo)">
          <input
            value={targetCaseId}
            onChange={(e) => setTargetCaseId(e.target.value)}
            placeholder="alv-2026-06-04-0001"
            className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
        </Field>
        <Field label="Qué evidencia buscas">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Copia firmada del contrato N° 123-2026..."
            className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Monto TSYS">
            <input
              type="number"
              min="1"
              max="500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          </Field>
          <Field label="Días para reclamar">
            <input
              type="number"
              min="1"
              max="180"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          </Field>
        </div>
        <Field label="Tu pseudónimo (aportante-XXXX)">
          <input
            value={postedBy}
            onChange={(e) => setPostedBy(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
        </Field>

        <button
          type="submit"
          disabled={busy || !account}
          className="w-full rounded-lg bg-amber-600 px-4 py-3 text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {busy ? "Procesando..." : `Crear bounty de ${amount} TSYS`}
        </button>
      </form>

      {status && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100">
          {status}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
