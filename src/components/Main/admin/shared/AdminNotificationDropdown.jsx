import { useEffect, useMemo, useRef, useState } from "react"
import { FaRegCalendarTimes } from "react-icons/fa"
import { GoAlert } from "react-icons/go"
import { HiArchiveBoxXMark, HiOutlineBell } from "react-icons/hi2"

import { notificationDropdownPanelClass } from "../../notificationDropdownStyles"
const mockNotifications = [
  {
    id: "notif-low-stock",
    title: "Low stock item",
    message: "Biogesic 500mg reached its reorder point.",
    timeLabel: "Today, 9:24 AM",
    type: "low-stock",
    relatedModule: "purchase-requisition",
    isRead: false,
  },
  {
    id: "notif-expiring",
    title: "Expiring soon",
    message: "Omeprazole 20mg has a batch near expiry.",
    timeLabel: "Today, 8:10 AM",
    type: "expiring",
    relatedModule: "inventory",
    isRead: false,
  },
  {
    id: "notif-out-stock",
    title: "Out of stock",
    message: "One product currently has zero available stock.",
    timeLabel: "Yesterday, 4:35 PM",
    type: "out-of-stock",
    relatedModule: "inventory",
    isRead: false,
  },
]

const notificationStyles = {
  "low-stock": {
    icon: GoAlert,
    iconClass: "bg-amber-50 text-amber-500",
    dotClass: "bg-amber-400",
  },
  expiring: {
    icon: FaRegCalendarTimes,
    iconClass: "bg-red-50 text-red-500",
    dotClass: "bg-red-400",
  },
  "out-of-stock": {
    icon: HiArchiveBoxXMark,
    iconClass: "bg-red-50 text-red-500",
    dotClass: "bg-red-500",
  },
}

function AdminNotificationDropdown({ activeBranchId, adminId, onNavigate }) {
  void activeBranchId
  void adminId

  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)
  const dropdownRef = useRef(null)

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  )

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  const handleNotificationClick = (notification) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item
      )
    )
    setIsOpen(false)

    if (notification.relatedModule) {
      onNavigate?.(notification.relatedModule)
    }
  }

  const handleMarkAsRead = (event, notificationId) => {
    event.stopPropagation()
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="relative rounded-full border border-slate-200 bg-white p-3 text-slate-600 transition hover:border-[#0b6b51]/30 hover:text-[#0b6b51]"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <HiOutlineBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`fixed right-4 top-17 z-40 rounded-[22px] border border-slate-200 bg-white shadow-[0_22px_55px_rgba(15,23,42,0.16)] sm:absolute sm:right-0 sm:top-[calc(100%+0.75rem)] ${notificationDropdownPanelClass}`}>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Notifications
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {unreadCount} unread alert{unreadCount === 1 ? "" : "s"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={!notifications.length}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-[#0b6b51] transition hover:bg-[#0b6b51]/8 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              Clear all
            </button>
          </div>

          {notifications.length ? (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2">
              {notifications.map((notification) => {
                const style =
                  notificationStyles[notification.type] ??
                  notificationStyles["low-stock"]
                const Icon = style.icon

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className="flex w-full gap-3 px-5 py-4 text-left transition hover:bg-slate-50"
                  >
                    <span
                      className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${style.iconClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-slate-900">
                          {notification.title}
                        </span>
                        {!notification.isRead && (
                          <span
                            className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${style.dotClass}`}
                          />
                        )}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-slate-600">
                        {notification.message}
                      </span>
                      <span className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-slate-400">
                          {notification.timeLabel}
                        </span>
                        {!notification.isRead && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) =>
                              handleMarkAsRead(event, notification.id)
                            }
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" ||
                                event.key === " "
                              ) {
                                handleMarkAsRead(event, notification.id)
                              }
                            }}
                            className="rounded-lg px-2 py-1 text-xs font-semibold text-[#0b6b51] hover:bg-[#0b6b51]/8"
                          >
                            Mark read
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="grid min-h-40 place-items-center px-6 py-8 text-center">
              <div>
                <p className="font-semibold text-slate-700">
                  No notifications
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  New branch alerts will show here.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminNotificationDropdown
