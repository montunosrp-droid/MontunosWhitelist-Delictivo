import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function AlreadyWhitelistedPage() {
  const [, setLocation] = useLocation();

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
            <CardTitle className="text-base md:text-lg text-slate-100">
              Ya formas parte del lado delictivo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-sm md:text-[15px] text-slate-200">
            <p className="text-orange-300 font-medium">
              Tu cuenta de Discord ya tiene el rol de whitelist delictiva dentro
              de Montunos RP.
            </p>

            <p>
              No necesitas volver a hacer el formulario. Si crees que esto es un
              error o perdiste tu rol, abre un ticket en el Discord oficial
              explicando la situación y adjuntando evidencias.
            </p>

            <div className="pt-3 flex flex-col md:flex-row gap-3 justify-center">
              <Button
                onClick={() =>
                  window.open("https://discord.com/app", "_blank", "noopener")
                }
                className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-400 text-black font-semibold px-8 rounded-2xl shadow-[0_18px_40px_rgba(249,115,22,0.65)] hover:shadow-[0_20px_55px_rgba(249,115,22,0.9)]"
              >
                Ir al Discord
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
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
