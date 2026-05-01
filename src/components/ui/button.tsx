import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
}

const buttonVariants = {
  default: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30",
  destructive: "bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-700 hover:to-red-700 shadow-lg shadow-rose-500/25",
  outline: "border-2 border-emerald-500 bg-transparent text-emerald-600 hover:bg-emerald-500 hover:text-white dark:border-emerald-400 dark:text-emerald-400",
  secondary: "bg-gradient-to-r from-slate-700 to-slate-800 text-slate-100 hover:from-slate-800 hover:to-slate-900 shadow-lg shadow-slate-900/20 dark:from-slate-600 dark:to-slate-700",
  ghost: "text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30",
  link: "text-cyan-600 underline-offset-8 hover:underline hover:text-cyan-700 dark:text-cyan-400 font-semibold",
};

const buttonSizes = {
  default: "h-12 px-6 py-2 text-base",
  sm: "h-9 px-4 text-sm rounded-xl",
  lg: "h-14 px-8 text-lg rounded-2xl",
  icon: "h-12 w-12 rounded-xl",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", children, ...props }, ref) => {
    const variantClass = buttonVariants[variant] || buttonVariants.default;
    const sizeClass = buttonSizes[size] || buttonSizes.default;
    
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-2xl font-bold tracking-wide backdrop-blur-sm transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 ${variantClass} ${sizeClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";