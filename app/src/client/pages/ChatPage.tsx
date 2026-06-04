import { FormEvent, useState } from "react";

/**
 * Chat web (plan B5 de 06-demo-acceptance §6). Si Telegram/Discord caen
 * en el demo, este formulario invoca /api/agent/turn directamente desde
 * el browser. No requiere wallet ni auth.
 */

interface Turn {
  role: "user" | "alivia";
  text: string;
  caseId?: string;
}

export default function ChatPage() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [pseudonym, setPseudonym] = useState<string | null>(null);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;

    const userMessage = draft;
    setTurns((prev) => [...prev, { role: "user", text: userMessage }]);
    setDraft("");
    setSending(true);

    try {
      const res = await fetch("/api/agent/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "web",
          externalUserId: getOrAssignExternalId(),
          message: userMessage,
        }),
      });
      const data = (await res.json()) as {
        text: string;
        pseudonym: string;
        caseToMint?: { case_id: string };
      };
      setPseudonym(data.pseudonym);
      setTurns((prev) => [
        ...prev,
        { role: "alivia", text: data.text, caseId: data.caseToMint?.case_id },
      ]);
    } catch (err) {
      setTurns((prev) => [
        ...prev,
        { role: "alivia", text: "Tuve un problema. Volvé a intentar." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto flex h-screen max-w-2xl flex-col p-4">
      <header className="mb-4">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Alivia · Chat</h1>
        <p className="text-xs text-slate-500">
          Canal web (fallback). {pseudonym && `Identidad: ${pseudonym}`}
        </p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
        {turns.length === 0 && (
          <div className="text-center text-sm text-slate-500">
            Saludá a Alivia o describí un caso. Cuando estés listo, escribe <em>publicar</em>.
          </div>
        )}
        {turns.map((t, i) => (
          <div
            key={i}
            className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                t.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
              }`}
            >
              {t.text}
              {t.caseId && (
                <div className="mt-1 text-xs opacity-80">
                  Caso: <span className="font-mono">{t.caseId}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={sending}
          placeholder="Escribí a Alivia..."
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

function getOrAssignExternalId(): string {
  const KEY = "alivia-web-uid";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `web-${crypto.randomUUID()}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}
