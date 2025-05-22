import * as React from "react"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    // Ensure value is between 0 and 100
    const clampedValue = Math.max(0, Math.min(100, value))

    return (
      <div
        ref={ref}
        className={`relative w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${className}`}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-blue-500 transition-all"
          style={{ transform: `translateX(-${100 - clampedValue}%)` }}
        />
      </div>
    )
  }
)

Progress.displayName = "Progress"

export { Progress } 