import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-50 flex items-center justify-center relative overflow-hidden">
      {/* Brillos y destellos de fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* glow naranja detrás del logo */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
        {/* halo lateral rojo/naranja */}
        <div className="absolute bottom-[-8rem] left-[-4rem] h-72 w-72 rounded-full bg-orange-600/15 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        {/* textura tipo “humo / polvo” */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.12),transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),_rgba(0,0,0,1))]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4 md:px-6 lg:px-8 flex flex-col items-center">
        {/* LOGO */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="relative">
            {/* glow fuerte detrás del logo */}
            <div className="absolute inset-0 blur-2xl bg-orange-500/35 rounded-full scale-110" />
            <img
              src="/delictivo-logo.png"
              alt="Delictivo Logo"
              className="relative h-40 w-40 md:h-48 md:w-48 object-contain drop-shadow-[0_0_50px_rgba(249,115,22,0.9)] select-none"
            />
          </div>

          {/* “placa” pequeña arriba del título */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-black/60 px-4 py-1 text-[11px] uppercase tracking-[0.18em] text-orange-300/90 shadow-[0_0_18px_rgba(249,115,22,0.35)]">
            <span className="inline-block h-1 w-1 rounded-full bg-orange-400 animate-pulse" />
            Sistema Delictivo
          </div>
        </div>

        {/* TITULOS */}
        <div className="text-center mb-10 space-y-1">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wide text-orange-400 drop-shadow-[0_0_18px_rgba(249,115,22,0.9)]">
            Montunos RP
          </h1>
          <p className="text-lg md:text-2xl font-semibold tracking-wide text-slate-100">
            Whitelist{" "}
            <span className="text-orange-400/95 drop-shadow-[0_0_10px_rgba(249,115,22,0.7)]">
              Delictiva
            </span>
          </p>
          <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Zona exclusiva para organizaciones, bandas y gente que vive
            <span className="text-orange-300/90"> fuera de la ley</span>.  
            Sé claro, serio y mantén el rol al máximo nivel.
          </p>
        </div>

        {/* CARD PRINCIPAL */}
        <div className="w-full max-w-2xl">
          {/* borde “metálico” con glow */}
          <div className="rounded-[26px] bg-gradient-to-br from-orange-500/60 via-orange-700/40 to-amber-400/40 p-[1px] shadow-[0_0_40px_rgba(249,115,22,0.4)]">
            <div className="rounded-[24px] bg-gradient-to-b from-black/80 via-slate-950/95 to-black/95 px-6 py-7 md:px-8 md:py-8 border border-orange-500/10 shadow-[0_18px_45px_rgba(0,0,0,0.85)]">
              {/* Textos dentro de la card */}
              <div className="space-y-3 mb-6">
                <p className="text-sm md:text-base text-slate-200">
                  Inicia sesión con tu cuenta de Discord para{" "}
                  <span className="text-orange-300 font-medium">
                    verificar tu acceso al sistema delictivo
                  </span>{" "}
                  de Montunos RP.
                </p>
                <ul className="text-[11px] md:text-xs text-slate-400 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-orange-400" />
                    <span>
                      Solo se usa tu ID de Discord y datos básicos para validar tu
                      identidad.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-orange-500" />
                    <span>No compartimos tu información con terceros.</span>
                  </li>
                </ul>
              </div>

              {/* BOTÓN */}
              <div className="flex justify-center">
                <Button
                  onClick={handleLogin}
                  className="w-full md:w-auto bg-gradient-to-r from-orange-500 via-orange-600 to-amber-400 hover:from-orange-400 hover:via-orange-500 hover:to-amber-300 text-black font-semibold px-10 py-5 rounded-2xl text-sm md:text-base shadow-[0_18px_40px_rgba(249,115,22,0.65)] hover:shadow-[0_20px_55px_rgba(249,115,22,0.9)] border border-orange-300/70 transition-all duration-200 ease-out"
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-black/70" />
                    Entrar con Discord
                  </span>
                </Button>
              </div>

              {/* Mensaje soporte */}
              <p className="mt-4 text-[11px] md:text-xs text-center text-slate-500">
                Si tienes problemas para entrar, abre un ticket en el Discord
                oficial y selecciona la categoría{" "}
                <span className="text-orange-300/90 font-medium">Whitelist Delictiva</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
