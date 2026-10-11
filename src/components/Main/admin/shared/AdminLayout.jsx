import { useState } from "react"
import { HiBars3 } from "react-icons/hi2"

import AdminTopbar, { AdminTopbarActions } from "./AdminTopbar"
import AppSidebar from "../../../shared/layout/AppSidebar"

function AdminLayout({
  branchName,
  activeBranchId,
  adminId,
  adminName,
  profilePhoto,
  navigationItems,
  activeItemId,
  activeItemLabel,
  topbarEyebrow,
  topbarTitle,
  topbarContent,
  hideTopbar = false,
  showTopbarActions = true,
  stickyTopbar = true,
  subtitle,
  onItemSelect,
  onProfileClick,
  onSettingsClick,
  onLogout,
  children,
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const handleMobileItemSelect = (itemId) => {
    setIsMobileSidebarOpen(false)
    onItemSelect?.(itemId)
  }

  return (
    <div className="overflow-x-hidden bg-[#f9fafc] lg:h-screen lg:overflow-hidden">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-[#f9fafc] px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)] lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-[#0b6b51] transition hover:border-[#0b6b51]/30"
          aria-label="Open navigation"
        >
          <HiBars3 className="h-7 w-7" />
        </button>

        {showTopbarActions ? (
          <AdminTopbarActions
            activeBranchId={activeBranchId}
            adminId={adminId}
            adminName={adminName}
            profilePhoto={profilePhoto}
            onProfileClick={onProfileClick}
            onSettingsClick={onSettingsClick}
            onNotificationNavigate={onItemSelect}
            compact
          />
        ) : null}
      </header>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45"
            aria-label="Close navigation"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative h-full w-[min(82vw,270px)]">
            <AppSidebar
              navigationItems={navigationItems}
              activeItemId={activeItemId}
              onItemSelect={handleMobileItemSelect}
              onLogout={onLogout}
            />
          </div>
        </div>
      )}

      <div className="min-h-screen lg:h-screen lg:pl-[210px] xl:pl-[250px]">
        <div className="fixed inset-y-0 left-0 z-40 hidden lg:block lg:w-[210px] xl:w-[250px]">
          <AppSidebar
            navigationItems={navigationItems}
            activeItemId={activeItemId}
            onItemSelect={onItemSelect}
            onLogout={onLogout}
          />
        </div>

        <main className="min-w-0 overflow-x-hidden px-4 sm:px-6 lg:h-screen lg:overflow-y-auto lg:px-8">
          <div className="flex w-full min-w-0 flex-col gap-6 pb-4 pt-4 sm:pb-6 sm:pt-6 lg:pb-7 lg:pt-0">
            {!hideTopbar && (
              <div
                className={`z-20 bg-[#f9fafc] ${
                  stickyTopbar ? "lg:sticky lg:top-0" : ""
                }`}
              >
                <AdminTopbar
                  title={topbarTitle ?? branchName}
                  eyebrow={topbarEyebrow}
                  topbarContent={topbarContent}
                  subtitle={subtitle}
                  activeBranchId={activeBranchId}
                  adminId={adminId}
                  adminName={adminName}
                  profilePhoto={profilePhoto}
                  onProfileClick={onProfileClick}
                  onSettingsClick={onSettingsClick}
                  onNotificationNavigate={onItemSelect}
                  showActions={showTopbarActions}
                />
              </div>
            )}
            <section aria-label={activeItemLabel}>{children}</section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
