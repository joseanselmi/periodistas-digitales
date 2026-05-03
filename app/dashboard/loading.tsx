export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#020617] text-white animate-pulse">
      {/* Navbar skeleton */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-800" />
          <div className="w-16 h-4 bg-slate-800 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-14 h-6 bg-slate-800 rounded-full" />
          <div className="w-32 h-4 bg-slate-800 rounded hidden sm:block" />
        </div>
      </div>

      {/* Tab bar skeleton */}
      <div className="border-b border-slate-800/60 px-6 py-2 flex gap-2">
        {[80, 64, 100, 56].map((w, i) => (
          <div key={i} className={`h-8 bg-slate-800 rounded-lg`} style={{ width: w }} />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-16">
        {[1, 2].map(s => (
          <div key={s}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-6 rounded-full bg-slate-800" />
              <div className="w-24 h-6 bg-slate-800 rounded" />
              <div className="w-16 h-4 bg-slate-700 rounded" />
            </div>
            <div className="space-y-4">
              {[1, 2].map(g => (
                <div key={g} className="bg-[#0A0F1E] border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800" />
                      <div>
                        <div className="w-40 h-4 bg-slate-800 rounded mb-2" />
                        <div className="w-20 h-3 bg-slate-700 rounded" />
                      </div>
                    </div>
                    <div className="w-24 h-2 bg-slate-800 rounded-full hidden sm:block" />
                  </div>
                  {[1, 2, 3].map(c => (
                    <div key={c} className="flex items-center gap-4 px-6 py-3.5 border-b border-slate-800/40 last:border-0">
                      <div className="w-6 h-6 rounded-md bg-slate-800" />
                      <div className="w-3/4 h-3 bg-slate-800 rounded" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
