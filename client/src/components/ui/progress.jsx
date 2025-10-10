import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const clamped = Math.min(Math.max(value, 0), max);
    const percent = (clamped / max) * 100;
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-muted",
          className
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-primary transition-all"
          style={{ transform: `translateX(-${100 - percent}%)` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
