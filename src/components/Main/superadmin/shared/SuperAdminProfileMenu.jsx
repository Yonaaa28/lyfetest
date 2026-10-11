import { HiOutlineUserCircle } from "react-icons/hi2"

function SuperAdminProfileMenu({ onNavigate, profile }) {
  return (
    <button
      type="button"
      onClick={() => onNavigate?.("my-profile")}
      className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200 bg-white text-[#0b6b51] transition hover:border-[#0b6b51]/30 focus:outline-none focus:ring-2 focus:ring-[#0b6b51]/20 sm:h-12 sm:w-12"
      aria-label="Open account information"
      title="My Profile"
    >
      {profile.photo ? (
        <img
          src={profile.photo}
          alt=""
          className="h-7 w-7 rounded-full object-cover sm:h-8 sm:w-8"
        />
      ) : (
        <HiOutlineUserCircle className="h-7 w-7 sm:h-8 sm:w-8" />
      )}
    </button>
  )
}

export default SuperAdminProfileMenu
