import { useState } from "react"
import { HiOutlineArrowLeftOnRectangle } from "react-icons/hi2"

function LogoutConfirmModal({ onCancel, onConfirm }) {
  const [isShaking, setIsShaking] = useState(false)

  const shakeModal = () => {
    setIsShaking(false)
    window.requestAnimationFrame(() => {
      setIsShaking(true)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-6 backdrop-blur-[2px]"
      onMouseDown={shakeModal}
    >
      <style>
        {`
          @keyframes logout-modal-shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-5px); }
            80% { transform: translateX(5px); }
          }
        `}
      </style>
      <div
        className={`w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.28)] ${
          isShaking ? "animate-[logout-modal-shake_260ms_ease-in-out]" : ""
        }`}
        onAnimationEnd={() => setIsShaking(false)}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
      >
        <div>
          <div>
            <h2
              id="logout-confirm-title"
              className="text-xl font-extrabold text-slate-950"
            >
              Log out?
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Are you sure you want to log out of your account?
            </p>
          </div>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
          >
            <HiOutlineArrowLeftOnRectangle className="h-5 w-5" />
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoutConfirmModal
