import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { FiArchive, FiMoreVertical } from "react-icons/fi"

const MENU_WIDTH = 144
const MENU_GAP = 8
const SCREEN_PADDING = 12

export function ManageOptionActionMenu({ label, onArchive }) {
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 })

  const getMenuPosition = useCallback(() => {
    const button = buttonRef.current

    if (!button) {
      return null
    }

    const rect = button.getBoundingClientRect()
    const left = Math.min(
      Math.max(SCREEN_PADDING, rect.right - MENU_WIDTH),
      window.innerWidth - MENU_WIDTH - SCREEN_PADDING
    )
    const opensBelow = rect.bottom + MENU_GAP + 52 <= window.innerHeight
    const top = opensBelow ? rect.bottom + MENU_GAP : rect.top - MENU_GAP - 52

    return {
      left,
      top: Math.max(SCREEN_PADDING, top),
    }
  }, [])

  const handleToggle = (event) => {
    event.stopPropagation()

    if (isOpen) {
      setIsOpen(false)
      return
    }

    const nextPosition = getMenuPosition()

    if (!nextPosition) {
      return
    }

    setMenuPosition(nextPosition)
    setIsOpen(true)
  }

  const handleArchive = (event) => {
    event.stopPropagation()
    onArchive()
    setIsOpen(false)
  }

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const updateMenuPosition = () => {
      const nextPosition = getMenuPosition()

      if (nextPosition) {
        setMenuPosition(nextPosition)
      }
    }

    const handlePointerDown = (event) => {
      if (
        buttonRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return
      }

      setIsOpen(false)
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    window.addEventListener("resize", updateMenuPosition)
    window.addEventListener("scroll", updateMenuPosition, true)
    document.addEventListener("pointerdown", handlePointerDown, true)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("resize", updateMenuPosition)
      window.removeEventListener("scroll", updateMenuPosition, true)
      document.removeEventListener("pointerdown", handlePointerDown, true)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [getMenuPosition, isOpen])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="grid h-9 w-9 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-[#0b6b51]"
        aria-label={`More actions for ${label}`}
        aria-expanded={isOpen}
      >
        <FiMoreVertical className="h-5 w-5" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[90] rounded-xl border border-slate-200 bg-white p-1 shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
            style={{
              left: menuPosition.left,
              top: menuPosition.top,
              width: MENU_WIDTH,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleArchive}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-[#0b6b51]"
            >
              <FiArchive className="h-4 w-4" />
              Archive
            </button>
          </div>,
          document.body
        )}
    </>
  )
}
