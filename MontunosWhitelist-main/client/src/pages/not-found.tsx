import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function NotFoundPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-50 flex items-center justify-center relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[-4rem] h-72 w-72 rounded-full bg-orange-600/18 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-72 w-72 rounded-full bg-amber-400/12 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl px-4 text-center space-y-4">
        <p className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-black/60 px-4 py-1 text-[11px] uppercase tracking-[0.18em] text-orange-300/90 shadow-[0_0_18px_rgba(249,115,22,0.35)]">
          404 – Ruta delictiva no encontrada
        </p>

        <h1 className="text-3xl md:text-4xl font-extrabold text-orange-400 drop-shadow-[0_0_18px_rgba(249,115,22,0.9)]">
          Te fuiste por donde no era
        </h1>

        <p className="text-sm md:text-[15px] text-slate-300 max-w-lg mx-auto">
          La página que intentas abrir no existe en el sistema de whitelist
          delictiva. Puede que el enlace esté roto o que el proceso haya
          cambiado.
        </p>

        <div className="flex justify-center pt-2">
          <Button
            onClick={() => setLocation("/")}
            className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-400 text-black font-semibold px-8 rounded-2xl shadow-[0_18px_40px_rgba(249,115,22,0.65)] hover:shadow-[0_20px_55px_rgba(249,115,22,0.9)]"
          >
            Volver al inicio de la whitelist
          </Button>
        </div>
      </div>
    </div>
  );
}
