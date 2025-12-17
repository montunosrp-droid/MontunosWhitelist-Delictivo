export default function Instructions() {
  const go = () => {
    window.location.href = "/whitelist";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black px-4">
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-orange-500/30 bg-[#0b1624] shadow-2xl">
        <div className="w-full h-40">
          <img src="/banner.png" alt="Montunos RP" className="w-full h-full object-cover" />
        </div>

        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Instrucciones para la Whitelist – Montunos RP V2
          </h1>

          <p className="text-sm text-slate-300 mb-6">
            Antes de iniciar el formulario, lee con atención las siguientes indicaciones.
          </p>

          <ul className="text-left space-y-3 text-slate-200 mb-6">
            <li>• Tendrás <span className="text-orange-400 font-semibold">30 minutos</span> para completar el formulario.</li>
            <li>• <span className="text-orange-400 font-semibold">No cambies de pestaña</span>, no actualices la página y no copies respuestas.</li>
            <li>• Formularios incompletos o con datos incorrectos serán <span className="text-red-400 font-semibold">rechazados</span>.</li>
            <li>• El <span className="text-orange-400 font-semibold">Staff Delictivo</span> revisará tus respuestas y recibirás tu resultado por <span className="text-indigo-400 font-semibold">Discord</span>.</li>
          </ul>

          <p className="text-slate-300 mb-6">
            Cuando estés listo(a), podés comenzar.
            <br />
            <span className="text-orange-400 font-semibold">Éxitos en tu postulación.</span>
          </p>

          <button
            onClick={go}
            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-3 rounded-lg transition"
          >
            Comenzar
          </button>
        </div>
      </div>
    </div>
  );
}
