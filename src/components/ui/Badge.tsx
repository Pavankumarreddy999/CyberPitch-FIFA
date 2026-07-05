import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-blue-600 text-white hover:bg-blue-700",
        secondary:
          "border-transparent bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
        destructive:
          "border-transparent bg-red-600 text-white hover:bg-red-700",
        outline: "text-gray-950 dark:text-white",
        success:
          "border-transparent bg-green-600 text-white hover:bg-green-700",
        warning:
          "border-transparent bg-yellow-600 text-white hover:bg-yellow-700",
        critical:
          "border-transparent bg-red-700 text-white hover:bg-red-800",
        high:
          "border-transparent bg-orange-600 text-white hover:bg-orange-700",
        medium:
          "border-transparent bg-yellow-600 text-white hover:bg-yellow-700",
        low:
          "border-transparent bg-green-600 text-white hover:bg-green-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
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