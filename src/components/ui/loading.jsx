import { Loader2 } from "lucide-react"
import { cn } from "../../lib/utils"

export const Loading = ({ className, size = "default", text = "Cargando..." }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  }

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

export const LoadingSpinner = ({ size = "default", className }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  }

  return <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
}

export const LoadingOverlay = ({ children, loading, text = "Cargando..." }) => {
  if (!loading) return children

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <Loading text={text} />
      </div>
    </div>
  )
}
