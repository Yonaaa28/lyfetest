import { Children, isValidElement, useEffect, useRef, useState } from "react"
import { FiChevronDown, FiSettings } from "react-icons/fi"

export function ModalField({ label, children, className = "" }) {
  return (
    <div className={`block ${className}`}>
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>
      {children}
    </div>
  )
}

export function TextInput({ icon: Icon, className = "", ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      )}
      <input
        {...props}
        className={`h-11 w-full rounded-xl border border-slate-200 bg-white ${
          Icon ? "pl-11" : "pl-4"
        } pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15 ${className}`}
      />
    </div>
  )
}

const sanitizeWholeNumber = (value) => value.replace(/\D/g, "")
const sanitizeLettersOnly = (value) => value.replace(/[^A-Za-z\s]/g, "")

const sanitizePrice = (value) => {
  const numericValue = value.replace(/[^\d.]/g, "")
  const [wholePart, ...decimalParts] = numericValue.split(".")
  const decimalPart = decimalParts.join("").slice(0, 2)

  return decimalParts.length ? `${wholePart}.${decimalPart}` : wholePart
}

export function WholeNumberInput({ value, onChange, ...props }) {
  return (
    <TextInput
      {...props}
      inputMode="numeric"
      value={value}
      onChange={(event) =>
        onChange?.({
          ...event,
          target: {
            ...event.target,
            value: sanitizeWholeNumber(event.target.value),
          },
        })
      }
    />
  )
}

export function PriceInput({ value, onChange, className = "", ...props }) {
  return (
    <div className="relative">
      {value && (
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
          ₱
        </span>
      )}
      <TextInput
        {...props}
        inputMode="decimal"
        value={value}
        onChange={(event) =>
          onChange?.({
            ...event,
            target: {
              ...event.target,
              value: sanitizePrice(event.target.value),
            },
          })
        }
        className={`${value ? "pl-8" : ""} ${className}`}
      />
    </div>
  )
}

export function DecimalInput({ value, onChange, ...props }) {
  return (
    <TextInput
      {...props}
      inputMode="decimal"
      value={value}
      onChange={(event) =>
        onChange?.({
          ...event,
          target: {
            ...event.target,
            value: sanitizePrice(event.target.value),
          },
        })
      }
    />
  )
}

export function LettersOnlyInput({ value, onChange, ...props }) {
  return (
    <TextInput
      {...props}
      value={value}
      onChange={(event) =>
        onChange?.({
          ...event,
          target: {
            ...event.target,
            value: sanitizeLettersOnly(event.target.value),
          },
        })
      }
    />
  )
}

export function SelectInput({
  children,
  className = "",
  manageLabel,
  onManageClick,
  value,
  onChange,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef(null)
  const options = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => ({
      value: String(child.props.value ?? ""),
      label: child.props.children,
      disabled: child.props.disabled,
    }))
  const searchableOptions = options.filter((option) => option.value !== "")
  const filteredOptions = searchableOptions.filter((option) =>
    String(option.label).toLowerCase().includes(searchTerm.toLowerCase())
  )
  const selectedOption = options.find((option) => option.value === value)
  const placeholder = options.find((option) => option.value === "")
  const displayLabel =
    selectedOption?.value || value
      ? selectedOption?.label ?? value
      : placeholder?.label ?? "Select option"
  const inputValue = isOpen ? searchTerm : value ? displayLabel : ""

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const closeDropdown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", closeDropdown, true)

    return () => {
      document.removeEventListener("mousedown", closeDropdown, true)
    }
  }, [isOpen])

  const handleSelect = (optionValue) => {
    onChange?.({ target: { value: optionValue } })
    setSearchTerm("")
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <div
        className={`flex h-11 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-[#0b6b51] focus-within:ring-2 focus-within:ring-[#0b6b51]/15 ${
          disabled ? "bg-slate-50" : ""
        } ${className}`}
      >
        <input
          type="text"
          disabled={disabled}
          value={inputValue}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onChange={(event) => {
            setSearchTerm(event.target.value)
            setIsOpen(true)
          }}
          placeholder={value ? String(displayLabel) : placeholder?.label}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
        />
        <FiChevronDown
          onClick={() => !disabled && setIsOpen((currentState) => !currentState)}
          className={`h-4 w-4 shrink-0 cursor-pointer text-slate-500 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-40 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
          <div className="sticky top-0 z-10 mb-1 space-y-1 bg-white pb-1">
            {manageLabel && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setSearchTerm("")
                  onManageClick?.()
                }}
                className="flex w-full items-center gap-3 rounded-lg bg-white px-3 py-3 text-left text-sm font-bold text-slate-900 transition hover:bg-slate-50"
              >
                <FiSettings className="h-5 w-5 text-slate-900" />
                {manageLabel}
              </button>
            )}
          </div>

          {filteredOptions.length ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  option.value === value
                    ? "bg-emerald-50 text-[#0b6b51]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-sm font-semibold text-slate-400">
              No options found.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function FilterSelect({ label, value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)
  const selectedLabel = value || placeholder
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.trim().toLowerCase())
  )

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const closeDropdown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", closeDropdown, true)

    return () => {
      document.removeEventListener("mousedown", closeDropdown, true)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSelect = (nextValue) => {
    onChange(nextValue)
    setSearchTerm("")
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <span className="text-xs font-bold text-slate-600">{label}</span>
      <div className="relative mt-2">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : selectedLabel}
          onFocus={() => {
            setSearchTerm("")
            setIsOpen(true)
          }}
          onClick={() => setIsOpen(true)}
          onChange={(event) => {
            setSearchTerm(event.target.value)
            setIsOpen(true)
          }}
          placeholder={placeholder}
          className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-xs font-semibold text-slate-600 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
          role="combobox"
          aria-expanded={isOpen}
        />
        <FiChevronDown
          onClick={() => {
            setIsOpen((currentState) => !currentState)
            inputRef.current?.focus()
          }}
          className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-slate-500 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-50 max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
          <button
            type="button"
            onClick={() => handleSelect("")}
            className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition ${
              !value
                ? "bg-emerald-50 text-[#0b6b51]"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {placeholder}
          </button>

          {filteredOptions.length ? (
            filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition ${
                  option === value
                    ? "bg-emerald-50 text-[#0b6b51]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="truncate">{option}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-xs font-semibold text-slate-400">
              No options found.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
