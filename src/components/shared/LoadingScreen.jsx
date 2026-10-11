import LoadingDots from "./LoadingDots"

function LoadingScreen({
  message = "Loading",
  fullScreen = true,
  logoSrc = "/Logo.jpg",
}) {
  const containerClass = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-white/95 px-6"
    : "flex w-full items-center justify-center px-6 py-10"

  return (
    <div className={containerClass} role="status" aria-live="polite">
      <div className="flex flex-col items-center text-center">
        <img
          src={logoSrc}
          alt="Lyfe Pharmacy logo"
          className="h-22 w-22 rounded-full object-cover shadow-[0_8px_24px_rgba(0,0,0,0.10)] "
        />
        <p className="mt-5 text-lg font-semibold text-[#0d5c17] sm:text-xl">
          {message}
        </p>
        <LoadingDots className="mt-4" />
      </div>
    </div>
  )
}

export default LoadingScreen
