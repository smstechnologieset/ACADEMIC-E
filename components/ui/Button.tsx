import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "white";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    const sizeClasses = {
      sm: "px-3.5 py-1.5 text-xs font-semibold rounded-lg",
      md: "px-5 py-2.5 text-sm font-semibold rounded-xl",
      lg: "px-7 py-3.5 text-base font-semibold rounded-xl",
    };

    const variantClasses = {
      primary:
        "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98]",
      secondary:
        "bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 active:scale-[0.98]",
      outline:
        "border border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-700 hover:bg-blue-50/50 active:scale-[0.98] bg-white",
      white:
        "bg-white hover:bg-slate-50 text-blue-900 border border-slate-200 shadow-sm active:scale-[0.98]",
      ghost:
        "text-slate-600 hover:text-blue-700 hover:bg-blue-50/60 active:scale-[0.98]",
      danger:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 active:scale-[0.98]",
      success:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-[0.98]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none font-medium",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
