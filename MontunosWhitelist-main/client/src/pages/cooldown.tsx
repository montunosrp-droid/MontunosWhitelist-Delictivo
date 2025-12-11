import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function CooldownPage() {
  const [, setLocation] = useLocation();
  const [hoursLeft, setHoursLeft] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("left");
    const num = raw ? Number(raw) : NaN;
    if (!Number.isNaN(num) && num > 0) {
      setHoursLeft(num);
    } else {
      setHoursLeft(null);
    }
  }, []);

  const goBack = () => setLocation("/");

  const text =
    hoursLeft && hoursLeft > 0
      ? `Debes esperar aproximadamente ${hoursLeft} hora${
          hoursLeft > 1 ? "s" : ""
        } antes de volver a intentar.`
      : "Tu tiempo de intento ya está bloqueado temporalmente. Intenta más tarde.";

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-50 flex items-center justify-center relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[-4rem] h-72 w-72 rounded-full bg-orange-600/18 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-72 w-72 rounded-full bg-amber-400/12 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.10),transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),_rgba(0,0,0,1))]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl px-4 md:px-6">
        <Card className="bg-black/85 border border-orange-500/25 shadow-[0_18px_45px_rgba(0,0,0,0.9)]">
          <CardHeader className="border-b border-orange-500/15">
            <CardTitle className="flex items-center gap-3 text-base md:text-lg text-slate-100">
              <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
              Cooldown de Whitelist Delictiva
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-sm md:text-[15px] text-slate-200">
            <p className="text-orange-300 font-medium">
              Te adelantaste demasiado o ya intentaste la whitelist hace poco.
            </p>

            <p>{text}</p>

            <p className="text-xs md:text-sm text-slate-400">
              Este sistema protege la whitelist delictiva de spam y de gente que
              quiere probar suerte respondiendo al azar. Aprovecha el tiempo
              para leer normativas y pensar bien tus respuestas.
            </p>

            <div className="pt-3 flex justify-center">
              <Button
                onClick={goBack}
                variant="outline"
                className="border-orange-500/60 text-orange-200 bg-black/60 hover:bg-orange-500/10 hover:text-orange-300 rounded-2xl px-8"
              >
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
