import * as React from "react"
import { cn } from "../../lib/utils"

const buttonVariants = (variant, size) => {
    const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 transition-all duration-200"

    const variants = {
        default: "bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20",
        premium: "bg-[image:var(--gradient-primary)] text-primary-foreground hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline: "border-2 border-primary/20 bg-background/50 backdrop-blur-sm text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-primary/10 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20",
    }

    const sizes = {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-2xl px-10 text-base font-bold",
        icon: "h-10 w-10 rounded-xl",
    }

    return cn(base, variants[variant || 'default'], sizes[size || 'default'])
}

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
    return (
        <button
            className={cn(buttonVariants(variant, size), className)}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button, buttonVariants }
