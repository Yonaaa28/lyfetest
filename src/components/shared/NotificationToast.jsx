import { FiAlertCircle, FiCheckCircle, FiInfo, FiX, FiAlertTriangle } from "react-icons/fi"

const toastStyles = {
  success: {
    wrapper: "bg-[#0b8f3f] text-white ",
    icon: FiCheckCircle,
  },
  error: {
    wrapper: "bg-[#d64545] text-white ",
    icon: FiAlertCircle,
  },
  warning: {
    wrapper: "bg-[#d38b10] text-white",
    icon: FiAlertTriangle,
  },
  info: {
    wrapper: "bg-[#1d6fd8] text-white ",
    icon: FiInfo,
  },
}

function NotificationToast({ toast, onClose }) {
  const { id, title, message, type = "success" } = toast
  const config = toastStyles[type] ?? toastStyles.success
  const Icon = config.icon
  const toastText = message || title

  return (
    <div
      className={`inline-flex max-w-full items-center gap-3 rounded-2xl px-4 py-3 sm:flex sm:w-full sm:min-w-70 sm:max-w-90 ${config.wrapper}`}
      role="alert"
      aria-live="polite"
    >
      <Icon className="h-5 w-5 shrink-0" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{toastText}</p>
      </div>

      <button
        type="button"
        onClick={() => onClose(id)}
        className="shrink-0 rounded-full p-1 text-white/90 transition hover:bg-white/10 hover:text-white"
        aria-label="Close notification"
      >
        <FiX className="h-4 w-4" />
      </button>
    </div>
  )
}

export default NotificationToast
