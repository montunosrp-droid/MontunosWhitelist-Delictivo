import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-zinc-50 flex flex-col items-center justify-center px-4">
      {/* GLOW DEL LOGO */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-red-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl space-y-8">
        {/* LOGO */}
        <div className="flex flex-col items-center gap-3">
          {/* Cambiá el src por el logo delictivo que tengas en /public */}
          <img
            src="/delictivo-logo.png"
            alt="Montunos Delictivo"
            className="h-24 w-24 rounded-full shadow-[0_0_40px_rgba(239,68,68,0.7)] border border-red-500/60 object-contain bg-black/80"
          />

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              <span className="text-zinc-100">Montunos</span>{" "}
              <span className="bg-gradient-to-r from-red-500 via-red-400 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(248,113,113,0.8)]">
                Whitelist Delictiva
              </span>
            </h1>
            <p className="mt-2 text-sm md:text-base text-zinc-400">
              Verifica tu cuenta de Discord y aplica a la{" "}
              <span className="text-red-400 font-semibold">facción delictiva</span>{" "}
              de Montunos RP V2.
            </p>
          </div>
        </div>

        {/* CARD LOGIN */}
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-red-600/30 blur-xl opacity-60" />
          <div className="relative rounded-3xl bg-zinc-950/90 border border-red-600/40 shadow-[0_0_40px_rgba(239,68,68,0.4)] px-6 py-7 md:px-8 md:py-8">
            <div className="space-y-3 text-center">
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-50">
                Bienvenido al lado oscuro 😈
              </h2>
              <p className="text-xs md:text-sm text-zinc-400">
                Inicia sesión con Discord para comprobar tu whitelist delictiva.
                Solo los que respetan las{" "}
                <span className="text-red-400 font-semibold">
                  normas delictivas
                </span>{" "}
                pasan el filtro.
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                size="lg"
                onClick={handleLogin}
                className="w-full md:w-auto px-8 py-5 text-sm md:text-base font-semibold
                  bg-gradient-to-r from-red-600 via-red-500 to-amber-500
                  hover:from-red-500 hover:via-red-400 hover:to-amber-400
                  text-white shadow-[0_0_25px_rgba(239,68,68,0.9)] border border-red-500/70
                  rounded-2xl"
              >
                <span className="mr-2 text-lg">💀</span>
                Continuar con Discord
              </Button>
            </div>

            <p className="mt-4 text-[11px] md:text-xs text-zinc-500 text-center">
              Autenticación segura a través de Discord OAuth2.
              <br />
              Solo accedemos a tu información básica de perfil de Discord.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <p className="relative text-[11px] md:text-xs text-zinc-500 text-center">
          ¿Problemas para entrar o dudas sobre la whitelist delictiva?  
          <br />
          Abre un ticket en el Discord oficial de{" "}
          <span className="text-red-400 font-semibold">Montunos RP · Delictivo</span>.
        </p>
      </div>
    </div>
  );
}
