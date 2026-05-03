export default function GrupoLoading() {
  return (
    <div className="min-h-screen bg-[#020617] text-white animate-pulse">
      <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-16 h-4 bg-slate-800 rounded" />
          <div className="w-px h-4 bg-slate-700" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-800" />
            <div className="w-12 h-4 bg-slate-800 rounded" />
          </div>
        </div>
        <div className="w-14 h-6 bg-slate-800 rounded-full" />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-20 h-3 bg-slate-700 rounded" />
          <div className="w-2 h-3 bg-slate-700 rounded" />
          <div className="w-32 h-3 bg-slate-700 rounded" />
        </div>
        <div className="w-48 h-7 bg-slate-800 rounded mb-4" />
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-3 bg-slate-700 rounded" />
          <div className="w-32 h-1.5 bg-slate-800 rounded-full" />
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4 px-6 py-5 border-b border-slate-800/60 last:border-0">
              <div className="w-9 h-9 rounded-xl bg-slate-800" />
              <div className="flex-1">
                <div className="w-3/4 h-4 bg-slate-800 rounded mb-2" />
                <div className="w-1/2 h-3 bg-slate-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
