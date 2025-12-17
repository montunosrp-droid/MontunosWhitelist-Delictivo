import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function InstructionsPage() {
  const [, setLocation] = useLocation();

  // ⬇️ leemos los params que vienen del backend
  const params = new URLSearchParams(window.location.search);
  const f = params.get("f") ?? "1";
  const id = params.get("id");

  useEffect(() => {
    // Si no viene el ID, algo salió mal en el flujo
    if (!id) {
      setLocation("/?error=missing_id");
    }
  }, [id, setLocation]);

  const handleStart = async () => {
    try {
      // (opcional pero recomendado)
      // avisa al backend que inició la whitelist
      await fetch("/api/whitelist/start", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.warn("No se pudo registrar inicio de WL (no es crítico)");
    }

    // ⬇️ MUY IMPORTANTE: reenviar f + id
    setLocation(`/whitelist-form?f=${f}&id=${id}`);
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-50 flex items-center justify-center relative overflow-hidden">
      {/* FONDO */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[-4rem] h-72 w-72 rounded-full bg-orange-600/18 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-72 w-72 rounded-full bg-amber-400/12 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-orange-400">
            Instrucciones de la Whitelist Delictiva
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Léelo bien. Aquí no hay segundas oportunidades.
          </p>
        </div>

        <Card className="bg-black/80 border border-orange-500/20">
          <CardHeader>
            <CardTitle>Antes de empezar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>• Tenés 30 minutos exactos.</p>
            <p>• Cambiar de pestaña penaliza tiempo.</p>
            <p>• Trampa = fuera delictivo.</p>

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleStart}
                className="bg-orange-500 hover:bg-orange-400 text-black font-bold px-8 py-4 rounded-xl"
              >
                Entendido, comenzar whitelist
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
