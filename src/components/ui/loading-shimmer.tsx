import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingShimmerProps {
  className?: string;
  lines?: number;
  showIcon?: boolean;
}

export function LoadingShimmer({ className, lines = 3, showIcon = false }: LoadingShimmerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("space-y-3", className)}
    >
      {showIcon && (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-muted rounded-lg shimmer-loading" />
          <div className="w-32 h-4 bg-muted rounded shimmer-loading" />
        </div>
      )}
      
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-muted rounded shimmer-loading",
            i === 0 && "w-3/4",
            i === 1 && "w-full",
            i === 2 && "w-2/3",
            i > 2 && "w-5/6"
          )}
        />
      ))}
    </motion.div>
  );
}

export function CardShimmer({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "p-6 border rounded-xl bg-card space-y-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-muted rounded-lg shimmer-loading" />
        <div className="space-y-2 flex-1">
          <div className="w-1/2 h-4 bg-muted rounded shimmer-loading" />
          <div className="w-3/4 h-3 bg-muted rounded shimmer-loading" />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="w-full h-3 bg-muted rounded shimmer-loading" />
        <div className="w-4/5 h-3 bg-muted rounded shimmer-loading" />
        <div className="w-2/3 h-3 bg-muted rounded shimmer-loading" />
      </div>
      
      <div className="flex gap-2 pt-2">
        <div className="w-20 h-8 bg-muted rounded shimmer-loading" />
        <div className="w-24 h-8 bg-muted rounded shimmer-loading" />
      </div>
    </motion.div>
  );
}