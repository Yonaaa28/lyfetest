import { useState } from "react"
import { HiOutlineArrowLeftOnRectangle } from "react-icons/hi2"

import LogoutConfirmModal from "../logout/LogoutConfirmModal"

function AppSidebar({
  appName = "Lyfe Pharmacy",
  logoSrc = "/Logo.jpg",
  logoAlt = "Lyfe Pharmacy logo",
  navigationItems,
  activeItemId,
  onItemSelect,
  onLogout,
}) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false)
    onLogout?.()
  }

  return (
    <aside className="flex h-screen min-h-0 w-full flex-col overflow-hidden bg-[#003e30] p-2 py-6 text-white lg:px-3 lg:py-5 xl:p-2 xl:py-6">
      <div className="flex shrink-0 items-center gap-4 rounded-3xl px-0 py-3 lg:gap-3 lg:py-2 xl:gap-4 xl:py-3">
        <img
          src={logoSrc}
          alt={logoAlt}
          className="h-14 w-14 rounded-full object-cover ring-2 ring-white/35 lg:h-11 lg:w-11 xl:h-14 xl:w-14"
        />
        <div className="min-w-0">
          <p className="truncate text-xl font-bold text-white lg:text-lg xl:text-xl">
            {appName}
          </p>
        </div>
      </div>

      <nav className="mt-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 [scrollbar-width:none] lg:mt-7 xl:mt-10 [&::-webkit-scrollbar]:hidden">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = item.id === activeItemId
            const Icon = item.icon

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onItemSelect(item.id)}
                className={`flex w-full items-center gap-2 rounded-[15px] px-3 py-4 text-left text-base font-bold leading-snug transition lg:rounded-xl lg:px-2.5 lg:py-3 lg:text-sm xl:rounded-[15px] xl:px-3 xl:py-4 xl:text-base ${
                  isActive
                    ? "bg-white text-[#06513d]"
                    : "text-white/88 hover:bg-white/10"
                }`}
              >
                <Icon className="h-6 w-6 shrink-0 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                <span className="min-w-0 break-words">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <button
        type="button"
        onClick={() => setIsLogoutModalOpen(true)}
        className="mt-8 flex shrink-0 items-center gap-4 rounded-[20px] bg-black/10 px-5 py-4 text-base font-medium text-white/92 transition hover:bg-black/18 lg:mt-5 lg:gap-3 lg:rounded-2xl lg:px-4 lg:py-3 lg:text-sm xl:mt-8 xl:gap-4 xl:rounded-[20px] xl:px-5 xl:py-4 xl:text-base"
      >
        <HiOutlineArrowLeftOnRectangle className="h-6 w-6 shrink-0 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
        <span>Logout</span>
      </button>

      {isLogoutModalOpen && (
        <LogoutConfirmModal
          onCancel={() => setIsLogoutModalOpen(false)}
          onConfirm={handleConfirmLogout}
        />
      )}
    </aside>
  )
}

export default AppSidebar
