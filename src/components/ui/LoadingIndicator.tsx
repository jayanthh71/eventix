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
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
    >
      <div className="relative">
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-600`}
          style={{
            borderTopColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: "#3B82F6",
            borderLeftColor: "#3B82F6",
          }}
        />
      </div>
      {text && (
        <p
          className={`font-anek ${textSizeClasses[size]} font-medium text-white`}
        >
          {text}
        </p>
      )}
    </div>
  );
}
