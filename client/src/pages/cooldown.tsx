import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

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
  const leftRaw = params.get("left"); // fallback si cae viejo

  const until = useMemo(() => {
    const n = untilRaw ? Number(untilRaw) : NaN;
    if (Number.isFinite(n) && n > 0) return n;

    // fallback si todavía viene ?left=12 (viejo)
    const leftHours = leftRaw ? Number(leftRaw) : NaN;
    if (Number.isFinite(leftHours) && leftHours > 0) {
      return Date.now() + leftHours * 60 * 60 * 1000;
    }

    return 0;
  }, [untilRaw, leftRaw]);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const msLeft = until ? until - now : 0;
  const done = until ? msLeft <= 0 : false;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-black/40 p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Estás en cooldown</h1>

        {until ? (
          <>
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
          </>
        ) : (
          <p className="text-sm opacity-80 mb-4">
            No se recibió tiempo de cooldown. Volvé a intentar o revisá en Discord.
          </p>
        )}

        <div className="flex gap-3">
          <Link
            className="flex-1 rounded-xl border border-white/15 py-2 text-center font-semibold"
            href="/"
          >
            Volver al inicio
          </Link>

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
