import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-xl border-2 border-gray-100 bg-white/50 px-3 py-2 text-sm font-bold ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900/50 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:border-blue-500 transition-all shadow-sm",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
