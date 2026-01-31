import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "premium"
    size?: "default" | "sm" | "lg" | "icon" | "xl"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        const variants = {
            default: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
            destructive: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-900 dark:text-red-50 dark:hover:bg-red-900/90",
            outline: "border-2 border-gray-100 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50",
            secondary: "bg-gray-100 text-gray-900 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80",
            ghost: "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50",
            link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
            premium: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-indigo-500/30 active:scale-95 transition-all",
        }

        const sizes = {
            default: "h-11 px-4 py-2",
            sm: "h-9 rounded-lg px-3",
            lg: "h-12 rounded-xl px-8",
            icon: "h-11 w-11",
            xl: "h-14 rounded-2xl px-10 text-lg",
        }

        return (
            <Comp
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-black ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    variants[variant as keyof typeof variants] || variants.default,
                    sizes[size as keyof typeof sizes] || sizes.default,
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
