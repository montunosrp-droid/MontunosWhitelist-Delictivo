import { useEffect, useMemo, useState } from "react";

function formatMs(ms: number) {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function CooldownPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const untilRaw = params.get("until");
  const until = untilRaw ? Number(untilRaw) : NaN;

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Si no viene ?until=..., mostramos mensaje sin inventar 12
  if (!Number.isFinite(until) || until <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-black/40 p-6 shadow-xl">
          <h1 className="text-2xl font-bold mb-2">Estás en cooldown</h1>
          <p className="text-sm opacity-80 mb-4">
            No se recibió el tiempo exacto del cooldown. Volvé a intentar desde el inicio.
          </p>

          <div className="flex gap-3">
            <a
              className="flex-1 rounded-xl border border-white/15 py-2 text-center font-semibold"
              href="/"
            >
              Volver al inicio
            </a>

            <a
              className="flex-1 rounded-xl bg-white text-black py-2 text-center font-semibold"
              href="/api/auth/discord"
            >
              Reintentar
            </a>
          </div>
        </div>
      </div>
    );
  }

  const msLeft = until - now;
  const done = msLeft <= 0;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-black/40 p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Estás en cooldown</h1>
        <p className="text-sm opacity-80 mb-4">
          Podrás volver a intentar cuando termine el cooldown.
        </p>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-4">
          <p className="text-sm">
            {done ? (
              <>✅ Cooldown finalizado. Ya podés volver a intentar.</>
            ) : (
              <>
                ⏳ Tiempo restante:{" "}
                <span className="font-semibold">{formatMs(msLeft)}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex gap-3">
          <a
            className="flex-1 rounded-xl border border-white/15 py-2 text-center font-semibold"
            href="/"
          >
            Volver al inicio
          </a>

          <a
            className="flex-1 rounded-xl bg-white text-black py-2 text-center font-semibold"
            href="/api/auth/discord"
          >
            Reintentar
          </a>
        </div>
      </div>
    </div>
  );
}
