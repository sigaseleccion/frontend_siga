import * as React from "react";
import { cn } from "@/shared/utils/cn";

const variants = {
  default: {
    bg: "bg-white",
    glow: null,
    topLine: "bg-gradient-to-r from-blue-600 to-purple-600",
  },
  colorful: {
    bg: "bg-gradient-to-br from-white via-white to-purple-50",
    glow: (
      <>
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-purple-200/40 blur-2xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-blue-200/40 blur-2xl" />
      </>
    ),
    topLine: "bg-gradient-to-r from-blue-600 to-purple-600",
  },
  purple: {
    bg: "bg-gradient-to-br from-white via-purple-50 to-purple-100/60",
    glow: (
      <>
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-purple-300/40 blur-2xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-fuchsia-200/30 blur-2xl" />
      </>
    ),
    topLine: "bg-gradient-to-r from-purple-600 to-fuchsia-600",
  },
  blue: {
    bg: "bg-gradient-to-br from-white via-blue-50 to-blue-100/60",
    glow: (
      <>
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-300/40 blur-2xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-cyan-200/30 blur-2xl" />
      </>
    ),
    topLine: "bg-gradient-to-r from-blue-600 to-cyan-600",
  },
  yellow: {
    bg: "bg-gradient-to-br from-white via-amber-50 to-yellow-100/40",
    glow: (
      <>
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-yellow-200/30 blur-3xl" />
      </>
    ),
    topLine: "bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-400",
  },
};

const Card = React.forwardRef(
  (
    { className, children, variant = "default", showTopLine = false, ...props },
    ref,
  ) => {
    const selected = variants[variant] || variants.default;

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md",
          selected.bg,
          className,
        )}
        {...props}
      >
        {/* Línea superior opcional */}
        {showTopLine && selected.topLine && (
          <div
            className={cn("h-1 w-full absolute top-0 left-0", selected.topLine)}
          />
        )}

        {selected.glow}

        <div className="relative">{children}</div>
      </div>
    );
  },
);
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 relative", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 relative", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
