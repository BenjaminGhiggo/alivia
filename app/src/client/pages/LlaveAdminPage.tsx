import { FormEvent, useState } from "react";
import { useAuth } from "wasp/client/auth";
import { issueLlave } from "wasp/client/operations";

/**
 * Admin: emite NFT-Llave a un cliente B2B.
 * Spec: 04-nfts §6 + 03-use-cases (consulta premium).
 *
 * Auth: requiere User.isAdmin (lo verifica la action server-side).
 */

const TIERS = [
  { value: 0, label: "Lectura" },
  { value: 1, label: "Investigador" },
  { value: 2, label: "Enterprise" },
];

export default function LlaveAdminPage() {
  const { data: user, isLoading: authLoading } = useAuth();
  const [to, setTo] = useState("");
  const [tier, setTier] = useState(0);
  const [days, setDays] = useState("365");
  const [clientName, setClientName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ tokenId: string; txHash: string; explorerUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const r = await issueLlave({
        to,
        tier,
        validForDays: parseInt(days, 10),
        clientName,
      });
      setResult(r);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setBusy(false);
    }
  }

  if (authLoading) return <div className="p-8">Cargando...</div>;
  if (!user) return <div className="p-8 text-red-500">Necesitas estar autenticado.</div>;
  if (!user.isAdmin) return <div className="p-8 text-red-500">Sólo admins.</div>;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Emitir NFT-Llave</h1>
      <p className="mb-6 mt-2 text-slate-600 dark:text-slate-400">
        Suscripción B2B para clientes premium (compliance, banca, medios).
        El cliente luego usa <code>X-Alivia-Llave-Token</code> con su tokenId
        para autenticarse en endpoints premium de la API.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Wallet del cliente (0x...)">
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x7557c236c2F522f14b08ef3970A84a52669478d0"
            className="w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-800"
            required
          />
        </Field>
        <Field label="Tier">
          <select
            value={tier}
            onChange={(e) => setTier(parseInt(e.target.value, 10))}
            className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          >
            {TIERS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Vigencia (días)">
            <input
              type="number"
              min="1"
              max="730"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          </Field>
          <Field label="Cliente">
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Banco Falabella PE"
              className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              required
            />
          </Field>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? "Emitiendo on-chain (puede tardar 1-2 min)..." : "Emitir llave"}
        </button>
      </form>

      {error && <div className="mt-4 rounded bg-red-50 p-4 text-red-700">{error}</div>}

      {result && (
        <div className="mt-6 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <div className="font-semibold text-emerald-900 dark:text-emerald-200">
            Llave emitida ✓
          </div>
          <div className="mt-2 text-sm space-y-1">
            <div>Token ID: <span className="font-mono">{result.tokenId}</span></div>
            <div>
              Tx:{" "}
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline dark:text-blue-400"
              >
                {result.txHash.slice(0, 20)}...
              </a>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              El cliente debe usar <code>X-Alivia-Llave-Token: {result.tokenId}</code> en sus requests.
            </div>
          </div>
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
