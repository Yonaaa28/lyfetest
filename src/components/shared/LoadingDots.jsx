function LoadingDots({ className = "" }) {
  return (
    <div
      className={`flex items-center justify-center gap-2 text-[#0d5c17] ${className}`.trim()}
      aria-hidden="true"
    >
      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-current" />
    </div>
  )
}

export default LoadingDots
