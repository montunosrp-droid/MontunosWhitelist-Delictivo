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

// === TIMER PERSISTENTE + PENALIZACIÓN (por usuario + formulario) ===
const getExpiresKey = (id: string | null, f: FormId) =>
  `wl_expires_${id ?? "unknown"}_${f}`; // epoch ms (servidor)

const getPenaltyKey = (id: string | null, f: FormId) =>
  `wl_penalty_${id ?? "unknown"}_${f}`; // seconds

export default function WhitelistFormPage() {
  const [, setLocation] = useLocation();

  const [secondsLeft, setSecondsLeft] = useState(TOTAL_TIME_SECONDS);
  const [isTimeOver, setIsTimeOver] = useState(false);
  const [formUrl, setFormUrl] = useState<string>("");

  // ✅ evita doble timeout
  const timeoutSentRef = useRef(false);

  // ✅ evitar mandar start 2 veces
  const startSentRef = useRef(false);

  // ✅ Cuando se acaba el tiempo: avisar backend y SI expiró de verdad -> cooldown con ?until=
  const handleTimeout = async () => {
    if (timeoutSentRef.current) return;
    timeoutSentRef.current = true;

    setIsTimeOver(true);
    setSecondsLeft(0);

    try {
      const resp = await fetch("/api/whitelist/timeout", {
        method: "POST",
        credentials: "include",
      });

      if (resp.status === 401) {
        setLocation("/?error=not_authenticated");
        return;
      }

      const data = await resp.json().catch(() => ({} as any));

      // Si todavía NO expiró, no lo mandés a cooldown
      if (data?.ignored) {
        setLocation("/");
        return;
      }

      // ✅ expiró de verdad -> backend manda cooldownUntil (epoch ms)
      if (data?.cooldownUntil) {
        setLocation(`/cooldown?until=${data.cooldownUntil}`);
        return;
      }

      // fallback
      setLocation(
        `/cooldown?until=${Date.now() + COOLDOWN_HOURS * 60 * 60 * 1000}`
      );
    } catch (err) {
      console.error("Error enviando timeout de whitelist:", err);
      setLocation(
        `/cooldown?until=${Date.now() + COOLDOWN_HOURS * 60 * 60 * 1000}`
      );
    }
  };

  // ✅ MARCAR INICIO REAL DE WL (backend devuelve expiresAt)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (startSentRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const fParam = ((params.get("f") ?? "1") as FormId) || "1";
    const discordId = params.get("id");

    if (!discordId) return;

    startSentRef.current = true;

    (async () => {
      try {
        const resp = await fetch("/api/whitelist/start", {
          method: "POST",
          credentials: "include",
        });

        if (resp.status === 401) {
          setLocation("/?error=not_authenticated");
          return;
        }

        if (resp.status === 403) {
          setLocation("/need-general-whitelist");
          return;
        }

        const data = await resp.json().catch(() => ({} as any));
        if (data?.expiresAt) {
          window.localStorage.setItem(
            getExpiresKey(discordId, fParam),
            String(data.expiresAt)
          );
          window.localStorage.setItem(getPenaltyKey(discordId, fParam), "0");
        }
      } catch (err) {
        console.error("Error marcando inicio de whitelist:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ TIMER basado en expiresAt (servidor) + penalización
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const fParam = ((params.get("f") ?? "1") as FormId) || "1";
    const discordId = params.get("id");

    const expiresKey = getExpiresKey(discordId, fParam);
    const penaltyKey = getPenaltyKey(discordId, fParam);

    // Si no existe expiresAt aún, creamos uno temporal
    const now = Date.now();
    let expiresAt = Number(window.localStorage.getItem(expiresKey));
    if (!Number.isFinite(expiresAt) || expiresAt <= 0) {
      expiresAt = now + TOTAL_TIME_SECONDS * 1000;
      window.localStorage.setItem(expiresKey, String(expiresAt));
    }

    const timer = setInterval(() => {
      const currentNow = Date.now();

      const storedExpiresAt = Number(
        window.localStorage.getItem(expiresKey) ?? String(expiresAt)
      );
      const penaltySeconds = Number(
        window.localStorage.getItem(penaltyKey) ?? "0"
      );

      const remaining =
        Math.floor((storedExpiresAt - currentNow) / 1000) - penaltySeconds;

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
        const newPenalty = currentPenalty + 5 * 60;
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
        <Card className="bg-slate-950/80 border border-orange-500/50 shadow-2xl">
          <CardContent className="py-4 px-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-display text-white">
                Formulario de Whitelist Delictiva – Montunos RP
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-1">
                Tienes{" "}
                <span className="font-semibold text-orange-400">30 minutos</span>{" "}
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

        {isTimeOver && (
          <Card className="bg-red-950/70 border border-red-500/70">
            <CardContent className="py-3 px-4 text-sm text-red-200">
              El tiempo ha finalizado. Serás enviado al cooldown del sistema
              delictivo.
            </CardContent>
          </Card>
        )}

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
                {isTimeOver ? "Tiempo finalizado. Redirigiendo..." : "Cargando formulario..."}
              </div>
            )}
          </CardContent>
        </Card>

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
