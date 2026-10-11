import { HiOutlineCog6Tooth, HiOutlineUserCircle } from "react-icons/hi2"

import AdminNotificationDropdown from "./AdminNotificationDropdown"

export function AdminTopbarActions({
  activeBranchId,
  adminId,
  adminName,
  profilePhoto,
  onProfileClick,
  onSettingsClick,
  onNotificationNavigate,
  compact = false,
  className = "",
}) {
  return (
    <div
      className={`flex items-center ${compact ? "gap-2" : "gap-3"} self-start ${className}`}
    >
      {onNotificationNavigate && (
        <AdminNotificationDropdown
          activeBranchId={activeBranchId}
          adminId={adminId}
          onNavigate={onNotificationNavigate}
        />
      )}
      {onSettingsClick && (
        <button
          type="button"
          onClick={onSettingsClick}
          className={`rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#0b6b51]/30 hover:text-[#0b6b51] ${
            compact ? "p-2.5" : "p-3"
          }`}
          aria-label="Settings"
        >
          <HiOutlineCog6Tooth className={compact ? "h-5 w-5" : "h-6 w-6"} />
        </button>
      )}
      <div className="group relative">
        <button
          type="button"
          onClick={onProfileClick}
          className={`flex items-center rounded-full border border-slate-200 bg-white text-[#0b6b51] transition hover:border-[#0b6b51]/30 ${
            compact ? "px-2.5 py-2" : "gap-3 px-4 py-2"
          }`}
          aria-label={adminName ? `${adminName} profile` : "Profile"}
          title="My Profile"
        >
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt=""
              className={compact ? "h-6 w-6 rounded-full object-cover" : "h-8 w-8 rounded-full object-cover"}
            />
          ) : (
            <HiOutlineUserCircle
              className={compact ? "h-6 w-6 text-[#0b6b51]" : "h-8 w-8 text-[#0b6b51]"}
            />
          )}
        </button>

        <div className="pointer-events-none absolute right-0 top-[calc(100%+0.75rem)] z-30 w-60 rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-left opacity-0 shadow-[0_18px_45px_rgba(15,23,42,0.12)] transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
          <p className="text-lg leading-tight font-medium text-slate-900">
            {adminName ?? "admin"}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Time in: <span className="font-medium text-slate-900">8:00 AM</span>
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Shift: <span className="font-medium text-emerald-700">In progress</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function AdminTopbar({
  title,
  eyebrow = "Branch Overview",
  topbarContent,
  activeBranchId,
  adminId,
  adminName,
  profilePhoto,
  onProfileClick,
  onSettingsClick,
  onNotificationNavigate,
  showActions = true,
}) {
  return (
    <header className="flex flex-col gap-4 bg-[#f9fafc] px-6 py-3 sm:flex-row sm:items-start sm:justify-between">
      <div className={topbarContent ? "min-w-0 flex-1" : undefined}>
        {topbarContent ?? (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b6b51]/60 sm:text-sm sm:tracking-[0.24em]">
              {eyebrow}
            </p>
            <h1 className="mt-1.5 text-xl font-bold text-slate-900 sm:mt-2 sm:text-3xl">
              {title}
            </h1>
          </>
        )}
      </div>

      {showActions ? (
        <AdminTopbarActions
          activeBranchId={activeBranchId}
          adminId={adminId}
          adminName={adminName}
          profilePhoto={profilePhoto}
          onProfileClick={onProfileClick}
          onSettingsClick={onSettingsClick}
          onNotificationNavigate={onNotificationNavigate}
          className="hidden lg:flex"
        />
      ) : null}
    </header>
  )
}

export default AdminTopbar
