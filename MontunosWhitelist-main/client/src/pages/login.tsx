import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
    document.title = "Montunos RP — Whitelist Delictiva";
  }, []);

  const loginUrl = "/auth/discord"; // Render lo maneja solito

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white px-4">
      {/* LOGO */}
      <img
        src="/delictivo-logo.png"
        alt="Delictivo Logo"
        className="h-48 mb-6 select-none drop-shadow-[0_0_25px_#ff4f00]"
      />

      {/* TITULO */}
      <h1 className="text-5xl font-extrabold text-[#ff4f00] drop-shadow-[0_0_12px_#ff4f00]">
        Montunos RP
      </h1>
      <h2 className="text-3xl font-bold mt-2 text-white/90 tracking-wide">
        Whitelist Delictiva
      </h2>

      {/* CARD */}
      <div className="mt-10 bg-[#111111] border border-[#ff4f00]/40 rounded-2xl p-8 w-full max-w-md shadow-[0_0_25px_#ff4f00]/20">
        <p className="text-center text-white/80 mb-6 leading-relaxed">
          Inicia sesión con tu cuenta de Discord para verificar tu acceso
          al sistema delictivo de Montunos RP.
        </p>

        {/* BOTÓN */}
        <a
          href={loginUrl}
          className="block w-full text-center bg-[#ff4f00] hover:bg-[#d84300] transition-all text-black font-bold py-3 rounded-xl shadow-[0_0_15px_#ff4f00]"
        >
          Entrar con Discord
        </a>
      </div>

      {/* FOOTER */}
      <p className="mt-6 text-white/40 text-sm">
        Si tienes problemas para entrar, abrí un ticket en Discord.
      </p>
    </div>
  );
}
