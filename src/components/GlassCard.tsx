import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  glow?: "cyan" | "purple" | "magenta" | "none";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow = "none", children, ...props }, ref) => {
    const glowClass = {
      cyan: "neon-glow-cyan",
      purple: "neon-glow-purple",
      magenta: "shadow-[0_0_15px_hsl(320_80%_55%/0.3),0_0_45px_hsl(320_80%_55%/0.1)]",
      none: "",
    }[glow];

    return (
      <motion.div
        ref={ref}
        className={cn(
          "glass rounded-lg p-6",
          glowClass,
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
export default GlassCard;
