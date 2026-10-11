import { useEffect, useMemo, useRef, useState } from "react"
import { HiOutlineArchiveBox, HiOutlineArrowLeft, HiOutlineBell, HiOutlineBuildingStorefront, HiOutlineCheckCircle, HiOutlineCircleStack, HiOutlineClock, HiOutlineClipboardDocumentCheck, HiOutlineKey } from "react-icons/hi2"

import { notificationDropdownPanelClass } from "../../notificationDropdownStyles"

const initialNotifications = [
  { id: "near-expiry-guinobatan", group: "critical", title: "Near Expiry Alert", reference: "Guinobatan Branch • 12 items", timeLabel: "9:15 AM", actionLabel: "View Items", relatedModule: "inventory-control", icon: HiOutlineClipboardDocumentCheck, isRead: false },
  { id: "low-stock-camalig", group: "critical", title: "Low Stock Alert", reference: "Camalig Branch • 8 products", timeLabel: "8:47 AM", actionLabel: "View Inventory", relatedModule: "inventory-control", icon: HiOutlineArchiveBox, isRead: false },
  { id: "purchase-request-pr-006", group: "pending", title: "Purchase Request Pending", reference: "PR-2026-006 • Camalig Branch", timeLabel: "8:30 AM", actionLabel: "Review Request", relatedModule: "purchase-requests", icon: HiOutlineClipboardDocumentCheck, isRead: false },
  { id: "branch-restore-daraga", group: "pending", title: "Branch Restore Request", reference: "Daraga Branch", timeLabel: "Yesterday, 4:22 PM", actionLabel: "Review Request", relatedModule: "backup-restore", icon: HiOutlineBuildingStorefront, isRead: false },
  { id: "database-backup-completed", group: "system", title: "Database Backup Completed", reference: "System Backup", timeLabel: "2:10 AM", relatedModule: "backup-restore", icon: HiOutlineCircleStack, isRead: false },
  { id: "branch-restored-manito", group: "system", title: "Branch Restored", reference: "Manito Branch", timeLabel: "Yesterday, 11:18 AM", relatedModule: "branches", icon: HiOutlineCheckCircle, isRead: true },
  { id: "user-created-polangui", group: "system", title: "User Account Created", reference: "Polangui Branch", timeLabel: "Yesterday, 9:40 AM", relatedModule: "users", icon: HiOutlineCheckCircle, isRead: true },
]

const sections = [
  { id: "attention", title: "Needs Attention", groups: ["critical", "pending"] },
  { id: "system", title: "System", groups: ["system"] },
]
const tones = {
  critical: { icon: "bg-red-50 text-red-600", dot: "bg-red-500" },
  pending: { icon: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
  system: { icon: "bg-emerald-50 text-[#0b6b51]", dot: "bg-[#0b6b51]" },
}

function SuperAdminNotificationDropdown({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullPage, setIsFullPage] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const dropdownRef = useRef(null)
  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications])
  const groupedNotifications = useMemo(() => sections.map((section) => ({ ...section, notifications: notifications.filter((item) => section.groups.includes(item.group)) })), [notifications])

  useEffect(() => {
    const refresh = () => {
      const requests = JSON.parse(window.localStorage.getItem("lyfe-password-reset-requests") ?? "[]")
      const readIds = JSON.parse(window.localStorage.getItem("lyfe-read-notification-ids") ?? "[]")
      const resetNotifications = requests.map((request) => ({ id: `reset-${request.id}`, group: request.status === "Pending" ? "pending" : "system", title: "Password Reset Request", reference: `${request.fullName} • ${request.employeeId} • ${request.branchName}`, timeLabel: formatRelativeTime(request.requestedAt), actionLabel: "View Request", relatedModule: "users", requestId: request.id, icon: HiOutlineKey, isRead: readIds.includes(`reset-${request.id}`) }))
      setNotifications([...resetNotifications, ...initialNotifications])
    }
    refresh()
    window.addEventListener("storage", refresh)
    window.addEventListener("focus", refresh)
    window.addEventListener("lyfe-password-reset-updated", refresh)
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("focus", refresh); window.removeEventListener("lyfe-password-reset-updated", refresh) }
  }, [])

  useEffect(() => {
    const handleOutsideClick = (event) => { if (!dropdownRef.current?.contains(event.target)) setIsOpen(false) }
    const handleEscape = (event) => { if (event.key === "Escape") { setIsOpen(false); setIsFullPage(false) } }
    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleEscape)
    return () => { document.removeEventListener("mousedown", handleOutsideClick); document.removeEventListener("keydown", handleEscape) }
  }, [])

  useEffect(() => {
    if (!isFullPage) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = previousOverflow }
  }, [isFullPage])

  const handleAction = (notification) => {
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item))
    const readIds = JSON.parse(window.localStorage.getItem("lyfe-read-notification-ids") ?? "[]")
    window.localStorage.setItem("lyfe-read-notification-ids", JSON.stringify([...new Set([...readIds, notification.id])]))
    setIsOpen(false)
    setIsFullPage(false)
    onNavigate?.(notification.relatedModule, notification)
  }
  const markAllRead = () => setNotifications((current) => current.map((item) => ({ ...item, isRead: true })))
  const openNotifications = () => {
    if (window.matchMedia("(max-width: 639px)").matches) {
      setIsOpen(false)
      setIsFullPage(true)
    } else {
      setIsOpen((value) => !value)
    }
  }

  if (isFullPage) return <FullNotificationsPage groupedNotifications={groupedNotifications} notifications={notifications} onAction={handleAction} onBack={() => setIsFullPage(false)} onMarkAllRead={markAllRead} unreadCount={unreadCount} />

  return <div ref={dropdownRef} className="relative">
    <button type="button" onClick={openNotifications} className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#0b6b51]/30 hover:text-[#0b6b51] sm:h-12 sm:w-12" aria-label="Notifications" aria-expanded={isOpen}><HiOutlineBell className="h-5 w-5 sm:h-6 sm:w-6" />{unreadCount ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">{unreadCount}</span> : null}</button>
    {isOpen ? <section className={`absolute right-0 top-[calc(100%+0.75rem)] z-50 hidden rounded-2xl border border-slate-200 bg-white shadow-[0_22px_55px_rgba(15,23,42,0.18)] sm:flex ${notificationDropdownPanelClass}`}>
      <header className="relative shrink-0 border-b border-slate-100 px-4 py-3.5"><h2 className="text-xl font-bold text-slate-950">Notifications</h2><p className="mt-0.5 text-xs font-medium text-slate-500"><span className="font-bold text-red-500">{unreadCount}</span> unread notification{unreadCount === 1 ? "" : "s"}</p><button type="button" onClick={markAllRead} disabled={!unreadCount} className="absolute right-4 top-3.5 min-h-8 text-xs font-bold text-[#0b6b51] disabled:text-slate-300">Mark all read</button></header>
      <NotificationList contained groupedNotifications={groupedNotifications} notifications={notifications} onAction={handleAction} />
      <footer className="shrink-0 border-t border-slate-100 px-4 py-1"><button type="button" onClick={() => { setIsOpen(false); setIsFullPage(true) }} className="flex min-h-10 w-full items-center justify-center text-sm font-bold text-[#0b6b51]">View all notifications <span className="ml-1">›</span></button></footer>
    </section> : null}
  </div>
}

function formatRelativeTime(value) { const elapsed = Date.now() - new Date(value).getTime(); const minutes = Math.max(0, Math.floor(elapsed / 60000)); if (minutes < 1) return "Just now"; if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`; const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`; return new Date(value).toLocaleDateString() }

function FullNotificationsPage({ groupedNotifications, notifications, onAction, onBack, onMarkAllRead, unreadCount }) {
  return <section className="fixed inset-0 z-[100] overflow-y-auto bg-[#f8fafb]">
    <div className="mx-auto min-h-dvh w-full max-w-4xl bg-white px-4 pb-8 pt-4 sm:px-6 sm:pt-6">
      <header className="flex items-center gap-3 border-b border-slate-200 pb-4"><button type="button" onClick={onBack} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Go back"><HiOutlineArrowLeft className="h-6 w-6" /></button><h1 className="text-xl font-bold text-slate-950 sm:text-2xl">Notifications</h1></header>
      <div className="flex items-center justify-between gap-4 py-4"><p className="text-sm font-semibold text-slate-500"><span className="font-bold text-red-500">{unreadCount}</span> unread</p><button type="button" onClick={onMarkAllRead} disabled={!unreadCount} className="min-h-10 text-sm font-bold text-[#0b6b51] disabled:text-slate-300">Mark all read</button></div>
      <NotificationList groupedNotifications={groupedNotifications} notifications={notifications} onAction={onAction} />
    </div>
  </section>
}

function NotificationList({ contained = false, groupedNotifications, notifications, onAction }) {
  if (!notifications.length) return <p className="py-12 text-center text-sm font-semibold text-slate-500">No notifications yet.</p>
  return <div className={contained ? "min-h-0 flex-1 overflow-y-auto px-4 py-1" : ""}>{groupedNotifications.map((section) => section.notifications.length ? <NotificationSection key={section.id} section={section} onAction={onAction} /> : null)}</div>
}

function NotificationSection({ onAction, section }) {
  return <section className="py-2.5"><div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2"><h3 className="text-xs font-bold uppercase tracking-wide text-slate-600">{section.title}</h3><span className="grid h-5 min-w-5 place-items-center rounded-full bg-slate-100 px-1.5 text-[11px] font-bold text-slate-600">{section.notifications.length}</span></div><div className="divide-y divide-slate-100">{section.notifications.map((notification) => <NotificationItem key={notification.id} notification={notification} onAction={onAction} />)}</div></section>
}

function NotificationItem({ notification, onAction }) {
  const Icon = notification.icon
  const tone = tones[notification.group]
  return <button type="button" onClick={() => onAction(notification)} className={`flex min-h-20 w-full gap-3 py-3 text-left transition hover:bg-slate-50 ${notification.isRead ? "opacity-70" : ""}`}><span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tone.icon}`}><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-2"><span className="min-w-0 text-sm font-bold leading-5 text-slate-900">{notification.title}</span>{!notification.isRead ? <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} /> : null}</span><span className="mt-0.5 block break-words text-[13px] font-semibold leading-[18px] text-slate-600">{notification.reference}</span><span className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3"><span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400"><HiOutlineClock className="h-3.5 w-3.5" />{notification.timeLabel}</span>{notification.actionLabel ? <span className="inline-flex min-h-8 items-center text-[13px] font-bold text-[#0b6b51]">{notification.actionLabel} <span className="ml-1">›</span></span> : null}</span></span></button>
}

export default SuperAdminNotificationDropdown
