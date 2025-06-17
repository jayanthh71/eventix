export default function LoadingIndicator({
  size = "md",
  text = "Loading...",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
  };

  const containerSizeClasses = {
    sm: "p-6",
    md: "p-8",
    lg: "p-12",
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <div
        className={`flex flex-col items-center justify-center gap-6 ${containerSizeClasses[size]}`}
      >
        <div className="relative">
          <div
            className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-700/30`}
            style={{
              borderTopColor: "#3B82F6",
              borderRightColor: "#8B5CF6",
            }}
          />
        </div>
        {text && (
          <p
            className={`font-anek ${textSizeClasses[size]} bg-clip-text font-medium text-white`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
