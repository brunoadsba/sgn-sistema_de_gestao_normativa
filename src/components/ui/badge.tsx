import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sgn-md border px-sgn-sm py-sgn-xs text-sgn-xs font-sgn-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-sgn-primary-500 text-white shadow-sgn-sm hover:bg-sgn-primary-600",
        secondary: "border-transparent bg-sgn-primary-100 text-sgn-primary-700 hover:bg-sgn-primary-200",
        destructive: "border-transparent bg-sgn-danger-500 text-white shadow-sgn-sm hover:bg-sgn-danger-600",
        success: "border-transparent bg-sgn-success-500 text-white shadow-sgn-sm hover:bg-sgn-success-600",
        warning: "border-transparent bg-sgn-warning-500 text-white shadow-sgn-sm hover:bg-sgn-warning-600",
        outline: "border-sgn-primary-200 text-sgn-primary-700 hover:bg-sgn-primary-50",
        ghost: "border-transparent text-sgn-primary-700 hover:bg-sgn-primary-50",
        muted: "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
      },
      size: {
        sm: "px-sgn-xs py-sgn-xs text-sgn-xs",
        default: "px-sgn-sm py-sgn-xs text-sgn-xs",
        lg: "px-sgn-md py-sgn-sm text-sgn-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  loading?: boolean
}

function Badge({ className, variant, size, icon, loading = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {loading && (
        <svg
          className="mr-sgn-xs h-sgn-xs w-sgn-xs animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && <span className="mr-sgn-xs">{icon}</span>}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
