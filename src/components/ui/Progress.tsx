import * as React from "react";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  className?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, className = "", ...props }, ref) => {
    const progressValue = Math.min(Math.max(value, 0), 100);

    return (
      <div
        ref={ref}
        className={`w-full bg-slate-700 rounded-full overflow-hidden ${className}`}
        role="progressbar"
        aria-valuenow={progressValue}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}
      >
        <div
          className="h-full bg-indigo-500 transition-all duration-300 ease-in-out"
          style={{ width: `${progressValue}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress"; 