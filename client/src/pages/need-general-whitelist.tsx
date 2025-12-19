export default function NeedGeneralWhitelistPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-black/40 p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Necesitás Whitelist General</h1>

        <p className="text-sm opacity-80 mb-4">
          Para iniciar la Whitelist Delictiva, primero tenés que tener el rol de
          Whitelist General en el Discord.
        </p>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-4 text-sm">
          Si ya lo tenés y aún así te manda aquí, puede ser un delay de Discord o
          falta de permisos de lectura. Probá reintentar.
        </div>

        <div className="flex gap-3">
          <a
            className="flex-1 rounded-xl border border-white/15 py-2 text-center font-semibold"
            href="/"
          >
            Volver al inicio
          </a>

          <a
            className="flex-1 rounded-xl bg-white text-black py-2 text-center font-semibold"
            href="/api/auth/discord"
          >
            Reintentar login
          </a>
        </div>
      </div>
    </div>
  );
}
