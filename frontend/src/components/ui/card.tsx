import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.ComponentProps<"div"> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  loading?: boolean
}

function Card({ 
  className, 
  variant = 'default', 
  size = 'md', 
  interactive = false, 
  loading = false, 
  ...props 
}: CardProps) {
  const baseClasses = "bg-card text-card-foreground flex flex-col gap-6 rounded-sgn-lg border shadow-sgn-sm"
  
  const variantClasses = {
    default: "border-border",
    elevated: "border-transparent shadow-sgn-lg",
    outlined: "border-sgn-primary-200 shadow-none",
    glass: "border-border/50 bg-card/80 backdrop-blur-sm"
  }
  
  const sizeClasses = {
    sm: "py-sgn-sm px-sgn-sm",
    md: "py-sgn-md px-sgn-md", 
    lg: "py-sgn-lg px-sgn-lg"
  }
  
  const interactiveClasses = interactive 
    ? "cursor-pointer transition-all duration-sgn-normal hover:shadow-sgn-md hover:scale-[1.02] active:scale-[0.98]" 
    : ""
    
  const loadingClasses = loading 
    ? "animate-sgn-pulse" 
    : ""

  return (
    <div
      data-slot="card"
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        interactiveClasses,
        loadingClasses,
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-sgn-sm px-sgn-md has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-sgn-md",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-sgn-tight font-sgn-semibold text-sgn-lg", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sgn-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-sgn-md", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-sgn-md [.border-t]:pt-sgn-md", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
