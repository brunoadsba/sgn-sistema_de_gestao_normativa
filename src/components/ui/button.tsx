import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sgn-md text-sgn-sm font-sgn-medium ring-offset-background transition-all duration-sgn-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-sgn-primary-500 text-white shadow-sgn-sm hover:bg-sgn-primary-600 hover:shadow-sgn-md active:bg-sgn-primary-700",
        destructive: "bg-sgn-danger-500 text-white shadow-sgn-sm hover:bg-sgn-danger-600 hover:shadow-sgn-md active:bg-sgn-danger-700",
        outline: "border border-sgn-primary-200 bg-background shadow-sgn-sm hover:bg-sgn-primary-50 hover:text-sgn-primary-600 hover:border-sgn-primary-300",
        secondary: "bg-sgn-primary-100 text-sgn-primary-700 shadow-sgn-sm hover:bg-sgn-primary-200 hover:shadow-sgn-md",
        ghost: "hover:bg-sgn-primary-50 hover:text-sgn-primary-600",
        link: "text-sgn-primary-500 underline-offset-4 hover:underline hover:text-sgn-primary-600",
        success: "bg-sgn-success-500 text-white shadow-sgn-sm hover:bg-sgn-success-600 hover:shadow-sgn-md active:bg-sgn-success-700",
        warning: "bg-sgn-warning-500 text-white shadow-sgn-sm hover:bg-sgn-warning-600 hover:shadow-sgn-md active:bg-sgn-warning-700",
      },
      size: {
        default: "h-10 px-sgn-md py-sgn-sm",
        sm: "h-9 rounded-sgn-sm px-sgn-sm text-sgn-xs",
        lg: "h-11 rounded-sgn-lg px-sgn-lg text-sgn-base",
        xl: "h-12 rounded-sgn-lg px-sgn-xl text-sgn-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-sgn-sm h-sgn-sm w-sgn-sm animate-spin"
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
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
