import React from "react";
import { cn } from "@/lib/utils";
import { ApplicationStatus } from "@/types";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: ApplicationStatus;
  variant?: "default" | "blue" | "success" | "danger" | "neutral" | "amber";
}

export function Badge({ className, status, variant, children, ...props }: BadgeProps) {
  let computedClass = "bg-slate-100 text-slate-700 border-slate-200";

  if (status) {
    switch (status) {
      case "approved":
        computedClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
        break;
      case "rejected":
        computedClass = "bg-rose-50 text-rose-700 border-rose-200";
        break;
      case "under_review":
        computedClass = "bg-amber-50 text-amber-700 border-amber-200";
        break;
      case "pending":
      default:
        computedClass = "bg-blue-50 text-blue-700 border-blue-200";
        break;
    }
  } else if (variant) {
    switch (variant) {
      case "blue":
        computedClass = "bg-blue-50 text-blue-700 border-blue-200";
        break;
      case "amber":
        computedClass = "bg-amber-50 text-amber-800 border-amber-200";
        break;
      case "success":
        computedClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
        break;
      case "danger":
        computedClass = "bg-rose-50 text-rose-700 border-rose-200";
        break;
      case "neutral":
        computedClass = "bg-slate-100 text-slate-700 border-slate-200";
        break;
    }
  }

  const formatStatus = (s?: ApplicationStatus) => {
    switch (s) {
      case "under_review":
        return "Under Review";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "pending":
        return "Pending Proof";
      default:
        return s;
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide",
        computedClass,
        className
      )}
      {...props}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {children || formatStatus(status)}
    </span>
  );
}
