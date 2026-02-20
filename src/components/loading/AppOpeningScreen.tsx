'use client'

interface AppOpeningScreenProps {
  title: string
  subtitle: string
  actionLabel: string
  onContinue: () => void
}

export function AppOpeningScreen({ title, subtitle, actionLabel, onContinue }: AppOpeningScreenProps) {
  const textureSvg =
    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6zM36 4V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060a09] text-white selection:bg-emerald-500 selection:text-white">
      <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-[70%] w-[70%] rounded-full bg-emerald-900/30 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: textureSvg }} />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[440px] flex-col items-center justify-center px-6">
        <section className="animate-in fade-in slide-in-from-bottom-5 duration-700 w-full rounded-[2.5rem] border border-emerald-500/10 bg-[#0c1412]/80 p-10 text-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-12">
          <div className="relative mx-auto mb-8 h-24 w-24">
            <div className="absolute inset-0 animate-pulse rounded-3xl bg-emerald-500/20 blur-2xl" />
            <div className="relative flex h-full w-full items-center justify-center rounded-3xl border border-white/20 bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-2xl">
              <span className="text-3xl font-bold tracking-tighter text-white drop-shadow-lg">SGN</span>
            </div>
          </div>

          <div className="mb-10 space-y-3">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-white">{title}</h1>
            <div className="flex items-center justify-center gap-2">
              <span className="h-px w-4 bg-emerald-500/30" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">{subtitle}</p>
              <span className="h-px w-4 bg-emerald-500/30" />
            </div>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-8 py-4 font-bold text-[#060a09] shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)] transition-all duration-500 hover:scale-[1.02] hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <span>{actionLabel}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </section>

        <p className="mt-10 text-center text-[10px] font-medium tracking-wider text-slate-500/80">
          &copy; 2026 - SGN: Sistema de Gestão Normativa
        </p>
      </main>
    </div>
  )
}
