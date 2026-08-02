import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <div className="relative flex items-center justify-center">
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "peer h-5 w-5 shrink-0 appearance-none rounded-md border border-outline ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:border-primary transition-all",
          className
        )}
        {...props}
      />
      <Check className="absolute hidden h-3.5 w-3.5 text-white pointer-events-none peer-checked:block" strokeWidth={3} />
    </div>
  )
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
