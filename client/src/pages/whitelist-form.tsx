import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TOTAL_TIME_SECONDS = 30 * 60; // 30 minutos
const COOLDOWN_HOURS = 12;

type FormId = "1";

const FORMS: Record<FormId, { baseUrl: string; idField: string }> = {
  "1": {
    baseUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSftx_McWR4woX-wYB-BI4jd6bvNrEirUq5sldh_SdtbQ1tvaQ/viewform",
    idField: "entry.1571619400",
  },
};

// === TIMER PERSISTENTE + PENALIZACIÓN ===
const getStartKey = (id: string | null, f: FormId) =>
  `wl_start_${id ?? "unknown"}_${f}`;

const getPenaltyKey = (id: string | null, f: FormId) =>
  `wl_penalty_${id ?? "unknown"}_${f}`;

export default function WhitelistFormPage() {
  const [, setLocation] = useLocation();

  const [secondsLeft, setSecondsLeft] = useState(TOTAL_TIME_SECONDS);
  const [isTimeOver, setIsTimeOver] = useState(false);
  const [formUrl, setFormUrl] = useState<string>("");

  // ✅ evita doble timeout por interval + visibilitychange
  const timeoutSentRef = useRef(false);

  // ✅ evitar mandar start 2 veces (React strict mode / re-render)
  const startSentRef = useRef(false);

  // ✅ Cuando se acaba el tiempo: avisar backend (si hay sesión) y mandar a cooldown
  const handleTimeout = async () => {
    if (timeoutSentRef.current) return;
    timeoutSentRef.current = true;

    // Cortamos el form en UI
    setIsTimeOver(true);
    setSecondsLeft(0);

    try {
      const resp = await fetch("/api/whitelist/timeout", {
        method: "POST",
        credentials: "include",
      });

      // Si no está autenticado, no lo mandés al cooldown (si no, se queda trabado)
      if (resp.status === 401) {
        setLocation("/?error=not_authenticated");
        return;
      }

      // cooldown con contador
      setLocation(`/cooldown?left=${COOLDOWN_HOURS}`);
      return;
    } catch (err) {
      console.error("Error enviando timeout de whitelist:", err);
      // fallback: igual lo mandamos al cooldown con el número fijo
      setLocation(`/cooldown?left=${COOLDOWN_HOURS}`);
    }
  };

  // ✅ MARCAR INICIO REAL DE WL (esto es lo que faltaba)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (startSentRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const discordId = params.get("id");

    // Si no viene id, no marcamos start
    if (!discordId) return;

    startSentRef.current = true;

    (async () => {
      try {
        const resp = await fetch("/api/whitelist/start", {
          method: "POST",
          credentials: "include",
        });

        if (resp.status === 401) {
          // sin sesión: mejor regresarlo al home para que haga login bien
          setLocation("/?error=not_authenticated");
          return;
        }
      } catch (err) {
        console.error("Error marcando inicio de whitelist:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ TIMER con tiempo persistente
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const fParam = ((params.get("f") ?? "1") as FormId) || "1";
    const discordId = params.get("id");

    const startKey = getStartKey(discordId, fParam);
    const penaltyKey = getPenaltyKey(discordId, fParam);

    const now = Date.now();
    let startTime = Number(window.localStorage.getItem(startKey));

    if (!startTime) {
      startTime = now;
      window.localStorage.setItem(startKey, String(startTime));
    }

    const timer = setInterval(() => {
      const currentNow = Date.now();

      const storedStartTime = Number(
        window.localStorage.getItem(startKey) ?? String(startTime)
      );
      const penaltySeconds = Number(
        window.localStorage.getItem(penaltyKey) ?? "0"
      );

      const elapsedSeconds =
        Math.floor((currentNow - storedStartTime) / 1000) + penaltySeconds;

      const remaining = TOTAL_TIME_SECONDS - elapsedSeconds;

      if (remaining <= 0) {
        clearInterval(timer);
        handleTimeout();
      } else {
        setSecondsLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Penalizar solo al ocultarse (cambiar tab/minimizar)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const fParam = ((params.get("f") ?? "1") as FormId) || "1";
    const discordId = params.get("id");
    const penaltyKey = getPenaltyKey(discordId, fParam);

    const applyPenalty = () => {
      setSecondsLeft((prev) => {
        if (prev <= 0) return 0;

        const currentPenalty = Number(
          window.localStorage.getItem(penaltyKey) ?? "0"
        );
        const newPenalty = currentPenalty + 5 * 60; // 5 min
        window.localStorage.setItem(penaltyKey, String(newPenalty));

        const updated = prev - 5 * 60;

        if (updated <= 0) {
          handleTimeout();
          return 0;
        }

        return updated;
      });
    };

    const handleVisibility = () => {
      if (document.hidden) applyPenalty();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ URL del form con prefill del ID
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const fParam = ((params.get("f") ?? "1") as FormId) || "1";
    const discordId = params.get("id");

    const config = FORMS[fParam] ?? FORMS["1"];

    if (!discordId) {
      setFormUrl(config.baseUrl);
      return;
    }

    const encodedId = encodeURIComponent(discordId);
    setFormUrl(`${config.baseUrl}?usp=pp_url&${config.idField}=${encodedId}`);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const timeText =
    String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");

  const handleExit = () => {
    // Penaliza al salir
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const fParam = ((params.get("f") ?? "1") as FormId) || "1";
      const discordId = params.get("id");
      const penaltyKey = getPenaltyKey(discordId, fParam);

      const currentPenalty = Number(
        window.localStorage.getItem(penaltyKey) ?? "0"
      );
      window.localStorage.setItem(penaltyKey, String(currentPenalty + 5 * 60));
    }

    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex flex-col items-center p-4">
      <div className="w-full max-w-5xl space-y-5">
        {/* HEADER + TIMER */}
        <Card className="bg-slate-950/80 border border-orange-500/50 shadow-2xl">
          <CardContent className="py-4 px-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-display text-white">
                Formulario de Whitelist Delictiva – Montunos RP
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-1">
                Tienes{" "}
                <span className="font-semibold text-orange-400">
                  30 minutos
                </span>{" "}
                para completar el formulario. No cambies de pestaña, no recargues
                la página y no copies respuestas.
              </p>
            </div>

            <Card
              className={`w-full md:w-auto bg-slate-900/80 border ${
                isTimeOver ? "border-red-500/80" : "border-orange-400/80"
              }`}
            >
              <CardContent className="py-2 px-4 flex items-center gap-3">
                <div className="text-xs text-slate-300 uppercase tracking-wide">
                  Tiempo restante
                </div>
                <div
                  className={`text-lg font-mono font-semibold ${
                    isTimeOver ? "text-red-400" : "text-orange-400"
                  }`}
                >
                  {timeText}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* AVISO TIEMPO ACABADO */}
        {isTimeOver && (
          <Card className="bg-red-950/70 border border-red-500/70">
            <CardContent className="py-3 px-4 text-sm text-red-200">
              El tiempo ha finalizado. Serás enviado al cooldown del sistema
              delictivo.
            </CardContent>
          </Card>
        )}

        {/* FORM */}
        <Card className="overflow-hidden bg-slate-950/80 border border-slate-800 shadow-2xl">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-base md:text-lg text-slate-100">
              Responde todas las preguntas con calma pero sin detenerte.
            </CardTitle>
          </CardHeader>

          <CardContent className="h-[70vh]">
            {!isTimeOver && formUrl ? (
              <iframe
                title="Whitelist Delictiva Montunos RP"
                src={formUrl}
                className="w-full h-full border-0 rounded-md"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-slate-300">
                {isTimeOver
                  ? "Tiempo finalizado. Redirigiendo..."
                  : "Cargando formulario..."}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SALIR */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExit}
            className="text-slate-300 hover:text-white hover:bg-slate-800/80"
          >
            Salir
          </Button>
        </div>
      </div>
    </div>
  );
}
