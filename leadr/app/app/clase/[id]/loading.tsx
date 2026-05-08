export default function ClaseLoading() {
  return (
    <div className="min-h-screen bg-[#020617] text-white animate-pulse">
      {/* Navbar */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center gap-4">
        <div className="w-5 h-5 bg-slate-800 rounded" />
        <div className="w-6 h-6 rounded-md bg-slate-800" />
        <div className="w-12 h-4 bg-slate-800 rounded" />
        <div className="w-48 h-3 bg-slate-700 rounded hidden sm:block" />
      </div>

      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="w-3/4 h-7 bg-slate-800 rounded mb-3" />
            <div className="w-full h-4 bg-slate-700 rounded mb-1" />
            <div className="w-2/3 h-4 bg-slate-700 rounded" />
          </div>
          <div className="w-12 h-6 bg-slate-800 rounded-full" />
        </div>
      </div>

      {/* Video/slides placeholder */}
      <div className="px-4 pb-5">
        <div className="aspect-video rounded-2xl bg-slate-800/60 max-w-7xl mx-auto" />
      </div>

      {/* Controls */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-40 h-12 bg-slate-800 rounded-lg" />
          <div className="w-32 h-4 bg-slate-700 rounded" />
        </div>
        <div className="flex justify-between gap-3 border-t border-slate-800 pt-6">
          <div className="w-5/12 h-14 bg-slate-800 rounded-xl" />
          <div className="w-5/12 h-14 bg-slate-800 rounded-xl ml-auto" />
        </div>
      </div>
    </div>
  )
}
