export default function ErrorMessage({
  message = "Something went wrong",
  className = "",
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-900/20 to-gray-900/80 p-8 backdrop-blur-sm">
        <div className="relative">
          <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-red-500/30 to-red-600/30">
              <svg
                className="h-7 w-7 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
          </div>

          <div
            className="absolute -top-1 -right-1 h-2 w-2 animate-bounce rounded-full bg-red-400/60"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="absolute -bottom-1 -left-1 h-1.5 w-1.5 animate-bounce rounded-full bg-red-500/40"
            style={{ animationDelay: "0.3s" }}
          />
        </div>

        <div className="text-center">
          <p className="font-anek bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-lg font-medium text-transparent">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
