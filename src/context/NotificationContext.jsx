import { useCallback, useMemo, useRef, useState } from "react"
import NotificationContainer from "../components/shared/NotificationContainer"
import NotificationContext from "./notificationContextObject"

function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timeoutMapRef = useRef(new Map())

  const removeToast = useCallback((id) => {
    const timeoutId = timeoutMapRef.current.get(id)

    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutMapRef.current.delete(id)
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({
      title = "",
      message = "",
      type = "success",
      duration = 3000,
    }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

      setToasts((currentToasts) => [...currentToasts, { id, title, message, type }])

      if (duration > 0) {
        const timeoutId = window.setTimeout(() => {
          removeToast(id)
        }, duration)

        timeoutMapRef.current.set(id, timeoutId)
      }

      return id
    },
    [removeToast]
  )

  const contextValue = useMemo(
    () => ({
      showToast,
      showSuccess: (message, options = {}) =>
        showToast({ message, type: "success", ...options }),
      showError: (message, options = {}) =>
        showToast({ message, type: "error", ...options }),
      showWarning: (message, options = {}) =>
        showToast({ message, type: "warning", ...options }),
      showInfo: (message, options = {}) =>
        showToast({ message, type: "info", ...options }),
      removeToast,
    }),
    [removeToast, showToast]
  )

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer toasts={toasts} onClose={removeToast} />
    </NotificationContext.Provider>
  )
}

export { NotificationProvider }
