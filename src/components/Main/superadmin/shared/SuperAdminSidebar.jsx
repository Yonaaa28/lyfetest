import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineHome,
} from "react-icons/hi2"

import { superAdminNavigationSections } from "./superAdminNavigation"

function SuperAdminSidebar({
  activeItemId,
  mobile = false,
  profileMode = false,
  onItemSelect,
  onLogout,
}) {
  if (mobile) {
    return (
      <aside className="flex h-screen w-full flex-col overflow-hidden bg-[#003e30] text-white shadow-[8px_0_30px_rgba(0,62,48,0.2)] supports-[height:100dvh]:h-dvh">
        <header className="flex shrink-0 items-center gap-2.5 px-3.5 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <img
            src="/Logo.jpg"
            alt="Lyfe Pharmacy logo"
            className="h-[42px] w-[42px] shrink-0 rounded-full object-cover ring-1 ring-white/35"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-bold leading-tight text-white">Lyfe Pharmacy</p>
            <p className="mt-0.5 text-xs font-bold text-emerald-300">Super Admin</p>
          </div>
        </header>

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {superAdminNavigationSections.map((section) => (
            <section key={section.id}>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = item.id === activeItemId

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onItemSelect(item.id)}
                      className={`flex h-11 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-semibold transition ${
                        isActive
                          ? "bg-white text-[#06513d]"
                          : "text-white/90 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="min-w-0 truncate">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </nav>

        <footer className="shrink-0 border-t border-white/15 px-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5">
          <button
            type="button"
            onClick={onLogout}
            className="flex h-11 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <HiOutlineArrowRightOnRectangle className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </button>
        </footer>
      </aside>
    )
  }

  if (profileMode) {
    return (
      <aside className="flex h-screen w-full flex-col items-center bg-[#003e30] px-5 py-8 text-white supports-[height:100dvh]:h-dvh">
        <button
          type="button"
          onClick={() => onItemSelect("dashboard")}
          className="grid h-14 w-14 place-items-center rounded-xl border border-white/70 text-white transition hover:bg-white/10"
          aria-label="Return to home"
          title="Home"
        >
          <HiOutlineHome className="h-6 w-6" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="h-screen w-full overflow-y-auto overscroll-contain bg-[#003e30] p-2 py-6 text-white shadow-[8px_0_30px_rgba(0,62,48,0.14)] [scrollbar-width:none] supports-[height:100dvh]:h-dvh lg:px-3 lg:py-5 xl:p-2 xl:py-6 [&::-webkit-scrollbar]:hidden">
      <div className="px-0 py-3 lg:py-2 xl:py-3">
        <div className="flex min-w-0 items-center gap-4 lg:gap-3 xl:gap-4">
          <img
            src="/Logo.jpg"
            alt="Lyfe Pharmacy logo"
            className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white/35 lg:h-11 lg:w-11 xl:h-14 xl:w-14"
          />
          <div className="min-w-0">
            <p className="truncate text-xl font-bold text-white lg:text-lg xl:text-xl">
              Lyfe Pharmacy
            </p>
            <p className="mt-0.5 text-sm font-bold text-emerald-300 lg:text-xs xl:text-sm">
              Super Admin
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-5 px-1 lg:mt-4 xl:mt-5">
        <div>
          {superAdminNavigationSections.map((section) => (
            <section key={section.id}>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = item.id === activeItemId

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onItemSelect(item.id)}
                      className={`flex w-full items-center gap-2 rounded-[15px] px-3 py-4 text-left text-base font-bold leading-snug transition lg:rounded-xl lg:px-2.5 lg:py-3 lg:text-sm xl:rounded-[15px] xl:px-3 xl:py-4 xl:text-base ${
                        isActive
                          ? "bg-white text-[#06513d]"
                          : "text-white/90 hover:bg-white/10"
                      }`}
                    >
                      <Icon className="h-6 w-6 shrink-0 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                      <span className="min-w-0 break-words leading-snug">
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </nav>

      <div className="px-1 pb-2 pt-5">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-[15px] px-3 py-3 text-left text-base font-semibold text-white/80 transition hover:bg-white/10 hover:text-white lg:rounded-xl lg:px-2.5 lg:text-sm xl:rounded-[15px] xl:px-3 xl:text-base"
        >
          <HiOutlineArrowRightOnRectangle className="h-6 w-6 shrink-0 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default SuperAdminSidebar

