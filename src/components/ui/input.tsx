import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-gray-900 dark:file:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 selection:bg-sgn-primary-500 selection:text-white dark:bg-white/[0.04] flex h-9 w-full min-w-0 rounded-sgn-md border border-gray-200 dark:border-white/[0.08] bg-white px-3 py-1 text-base shadow-sgn-sm transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-sgn-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-gray-900 dark:text-gray-100",
        "focus-visible:border-sgn-primary-500 focus-visible:ring-[3px] focus-visible:ring-sgn-primary-500/20",
        "aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Input }
