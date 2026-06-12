import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#0F5D58] text-white",
        secondary: "bg-[#5EEAD4] text-[#0F5D58]",
        outline: "border border-[#0F5D58] text-[#0F5D58]",
        destructive: "bg-red-100 text-red-700",
        warning: "bg-yellow-100 text-yellow-700",
        success: "bg-green-100 text-green-700",
        gray: "bg-gray-100 text-gray-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
