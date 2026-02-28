'use client'

import { motion } from 'framer-motion'

interface ScoreIndicadorProps {
  score: number
}

export function ScoreIndicador({ score }: ScoreIndicadorProps) {
  const cor =
    score >= 80 ? 'text-emerald-600'
      : score >= 60 ? 'text-amber-600'
        : score >= 40 ? 'text-orange-600'
          : 'text-red-600'

  const bgCor =
    score >= 80 ? 'bg-emerald-500/5 border-emerald-500/20'
      : score >= 60 ? 'bg-amber-500/5 border-amber-500/20'
        : score >= 40 ? 'bg-orange-500/5 border-orange-500/20'
          : 'bg-red-500/5 border-red-500/20'

  const porcentagem = Math.min(100, Math.max(0, score))
  const raio = 42
  const circunferencia = 2 * Math.PI * raio
  const isFull = porcentagem >= 100
  const offset = isFull ? 0 : circunferencia - (porcentagem / 100) * circunferencia
  const corTraco = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444'

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`flex flex-col items-center justify-center p-8 rounded-2xl border ${bgCor} min-w-[180px] bg-white/50 dark:bg-gray-900/50 backdrop-blur-3xl relative overflow-hidden transition-all duration-500`}
    >
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={raio} fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-100 dark:text-gray-800" />
          <motion.circle
            initial={{ strokeDashoffset: isFull ? 0 : circunferencia }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: "easeOut" }}
            cx="50" cy="50" r={raio}
            fill="none"
            stroke={corTraco}
            strokeWidth="6"
            strokeLinecap={isFull ? "butt" : "round"}
            strokeDasharray={circunferencia}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-black tracking-tighter leading-none ${cor}`}>{score}</span>
        </div>
      </div>
      <span className={`text-[9px] font-black uppercase tracking-[0.2em] mt-3 ${cor} bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full border border-white/20`}>
        {score >= 80 ? 'Excelente' : score >= 60 ? 'Parcial' : score >= 40 ? 'Baixa' : 'Crítica'}
      </span>
    </motion.div>
  )
}
