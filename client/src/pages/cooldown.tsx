import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const h = String(hours).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");
  const s = String(seconds).padStart(2, "0");

  return { hours, minutes, seconds, label: `${h}:${m}:${s}` };
}

export default function CooldownPage() {
  const [, setLocation] = useLocation();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const leftParam = params.get("left"); // viene desde el backend: /cooldown?left=HORAS
    let hoursLeft = Number(leftParam);

    // Si viene algo raro, usamos 12h por defecto
    if (!Number.isFinite(hoursLeft) || hoursLeft <= 0) {
      hoursLeft = 12;
    }

    const initialSeconds = Math.max(0, Math.round(hoursLeft * 60 * 60));
    setSecondsLeft(initialSeconds);

    if (initialSeconds <= 0) return;

    const timerId = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          window.clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  const handleBackHome = () => {
    setLocation("/");
  };

  const timeInfo =
    secondsLeft !== null ? formatTime(secondsLeft) : { label: "--:--:--", hours: 0, minutes: 0, seconds: 0 };

  const isFinished = secondsLeft !== null && secondsLeft <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#020617] to-black text-slate-50 flex flex-col items-center p-4">
      <div className="w-full max-w-3xl space-y-6 mt-10">
        {/* LOGO + TÍTULO */}
        <div className="flex flex-col items-center gap-3">
          <img
            src="/delictivo-logo.png"
            alt="Delictivo Logo"
            className="w-32 h-32 md:w-40 md:h-40 drop-shadow-[0_0_25px_rgba(249,115,22,0.65)]"
          />
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-orange-400 drop-shadow-[0_0_18px_rgba(249,115,22,0.65)]">
              Montunos RP – Sistema Delictivo
            </h1>
            <p className="text-sm md:text-base text-slate-300 mt-1">
              Estás en <span className="text-orange-400 font-semibold">cooldown</span> de la whitelist delictiva.
            </p>
          </div>
        </div>

        {/* CARD PRINCIPAL */}
        <Card className="bg-[#020617]/90 border border-orange-500/60 shadow-[0_0_40px_rgba(249,115,22,0.35)]">
          <CardHeader className="border-b border-orange-500/40">
            <CardTitle className="flex items-center justify-between text-sm md:text-base text-slate-100">
              <span>Cooldown activo – Whitelist Delictiva</span>
              <span className="text-[11px] md:text-xs uppercase tracking-[0.15em] text-orange-400">
                Anti-spam &amp; Anti-copy
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="py-5 px-4 md:px-6 space-y-5">
            {/* TEXTO EXPLICATIVO */}
            <div className="space-y-2 text-sm md:text-base text-slate-200">
              {!isFinished ? (
                <>
                  <p>
                    Para mantener el sistema{" "}
                    <span className="text-orange-400 font-semibold">limpio y serio</span>, cada intento fallido de
                    whitelist delictiva te deja en espera.
                  </p>
                  <p className="text-slate-300">
                    No es bug, no es error: es parte del <span className="text-orange-400 font-semibold">seguro</span>{" "}
                    del sistema para evitar abuso, copias y multi-cuentas.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Tu cooldown ha terminado. Ya puedes volver a intentar tu{" "}
                    <span className="text-orange-400 font-semibold">whitelist delictiva</span>.
                  </p>
                  <p className="text-slate-300">
                    Te recomendamos leer bien las normativas antes de volver a aplicar para evitar otro bloqueo.
                  </p>
                </>
              )}
            </div>

            {/* BLOQUE DEL CONTADOR */}
            <div className="grid md:grid-cols-[1.1fr,0.9fr] gap-4 items-center">
              <div className="bg-black/40 border border-orange-500/50 rounded-xl px-4 py-3 md:py-4">
                <p className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-slate-400 mb-1">
                  Tiempo restante
                </p>

                {!isFinished ? (
                  <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
                    <div className="font-mono text-3xl md:text-4xl font-semibold text-orange-400 drop-shadow-[0_0_18px_rgba(249,115,22,0.8)]">
                      {timeInfo.label}
                    </div>
                    <div className="text-xs md:text-sm text-slate-300">
                      Aproximadamente{" "}
                      <span className="font-semibold text-orange-300">
                        {timeInfo.hours}h {timeInfo.minutes}m
                      </span>{" "}
                      antes de que puedas volver a intentar.
                    </div>
                  </div>
                ) : (
                  <div className="font-mono text-2xl md:text-3xl font-semibold text-emerald-400 drop-shadow-[0_0_18px_rgba(34,197,94,0.8)]">
                    00:00:00
                  </div>
                )}
              </div>

              {/* RECOMENDACIONES */}
              <div className="space-y-1.5 text-xs md:text-sm text-slate-300">
                <p className="flex items-start gap-2">
                  <span className="mt-[2px] text-orange-400">•</span>
                  <span>
                    Aprovechá el tiempo para leer{" "}
                    <span className="text-orange-300 font-semibold">normativas generales y delictivas</span>.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="mt-[2px] text-orange-400">•</span>
                  <span>
                    No intentes forzar el sistema ni crear cuentas nuevas, eso solo complica tu historial dentro de
                    Montunos RP.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="mt-[2px] text-orange-400">•</span>
                  <span>
                    Si creés que hay un error, abrí un ticket con{" "}
                    <span className="text-orange-300 font-semibold">pruebas claras</span> y el staff lo revisa.
                  </span>
                </p>
              </div>
            </div>

            {/* BOTÓN */}
            <div className="flex justify-end pt-2">
              <Button
                variant={isFinished ? "default" : "outline"}
                onClick={handleBackHome}
                className={
                  isFinished
                    ? "bg-orange-500 hover:bg-orange-600 text-black font-semibold shadow-[0_0_22px_rgba(249,115,22,0.9)] border-none"
                    : "border-orange-400/70 text-orange-300 hover:bg-orange-500/10 hover:text-orange-200"
                }
              >
                {isFinished ? "Volver al inicio y reintentar" : "Volver al inicio"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PIE DE PÁGINA */}
        <p className="text-[11px] md:text-xs text-center text-slate-500 mt-2">
          Este cooldown forma parte del sistema de seguridad delictivo de{" "}
          <span className="text-orange-400 font-semibold">Montunos RP</span>.
        </p>
      </div>
    </div>
  );
}
