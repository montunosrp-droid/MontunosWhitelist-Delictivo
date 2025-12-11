import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function InstructionsPage() {
  const [, setLocation] = useLocation();

  const handleStart = () => {
    setLocation("/whitelist-form");
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-50 flex items-center justify-center relative overflow-hidden">
      {/* FONDO / GLOW */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[-4rem] h-72 w-72 rounded-full bg-orange-600/18 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-72 w-72 rounded-full bg-amber-400/12 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.10),transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),_rgba(0,0,0,1))]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4 md:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center mb-8 space-y-1">
          <p className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-black/60 px-4 py-1 text-[11px] uppercase tracking-[0.18em] text-orange-300/90 shadow-[0_0_18px_rgba(249,115,22,0.35)]">
            Briefing Delictivo
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-orange-400 drop-shadow-[0_0_18px_rgba(249,115,22,0.9)]">
            Instrucciones de la Whitelist Delictiva
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
            Léelo con calma antes de entrar al formulario. Si fallas aquí, no es
            porque el sistema esta bug… es porque no leíste.
          </p>
        </div>

        {/* CARD PRINCIPAL */}
        <Card className="bg-black/80 border border-orange-500/20 shadow-[0_18px_45px_rgba(0,0,0,0.9)]">
          <CardHeader className="border-b border-orange-500/15">
            <CardTitle className="text-base md:text-lg text-slate-100">
              Reglas rápidas antes de empezar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-5 text-sm md:text-[15px] text-slate-200">
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-400" />
                <p>
                  <span className="font-semibold text-orange-300">
                    Tienes 30 minutos
                  </span>{" "}
                  para completar el formulario. No te distraigas.
                </p>
              </li>

              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-400" />
                <p>
                  Cambiar de pestaña, minimizar o jugar con el navegador puede
                  activar penalizaciones de tiempo.{" "}
                  <span className="text-orange-300 font-semibold">
                    Mantente dentro del formulario
                  </span>{" "}
                  hasta que envíes tus respuestas.
                </p>
              </li>

              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-400" />
                <p>
                  Nada de copiar respuestas, pasar capturas o “ayudar” a otros a
                  contestar. Si detectamos trampa,{" "}
                  <span className="text-red-400 font-semibold">
                    quedas fuera delictivo 
                  </span>
                  .
                </p>
              </li>

              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-400" />
                <p>
                  Responde como{" "}
                  <span className="text-orange-300 font-semibold">
                    personaje delictivo serio
                  </span>
                  , no como meme. Rol, coherencia y sentido común prioritario
                </p>
              </li>

              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-400" />
                <p>
                  Al enviar el formulario confirmas que{" "}
                  <span className="text-orange-300 font-semibold">
                    leíste y aceptas las normativas del servidor
                  </span>{" "}
                  y que entiendes que el staff puede denegar tu entrada si no
                  cumples el estándar.
                </p>
              </li>
            </ul>

            <p className="text-xs md:text-sm text-slate-400 border-t border-orange-500/10 pt-4">
              Si te sale cooldown o error, no spamees tickets. Espera el tiempo
              indicado y vuelve a intentarlo.
            </p>

            <div className="flex justify-center pt-2">
              <Button
                onClick={handleStart}
                className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-400 hover:from-orange-400 hover:via-orange-500 hover:to-amber-300 text-black font-semibold px-10 py-5 rounded-2xl text-sm md:text-base shadow-[0_18px_40px_rgba(249,115,22,0.65)] hover:shadow-[0_20px_55px_rgba(249,115,22,0.9)] border border-orange-300/70 transition-all duration-200 ease-out"
              >
                Entendido, quiero comenzar la whitelist
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
