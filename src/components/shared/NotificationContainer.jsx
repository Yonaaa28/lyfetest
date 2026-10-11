import NotificationToast from "./NotificationToast"

function NotificationContainer({ toasts, onClose }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex max-w-[calc(100%-2rem)] flex-col items-end gap-3 sm:right-6 sm:top-6 sm:w-[calc(100%-2rem)] sm:max-w-sm sm:items-stretch">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <NotificationToast toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  )
}

export default NotificationContainer
