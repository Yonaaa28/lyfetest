import { useEffect, useMemo, useRef, useState } from "react"
import { CiBarcode } from "react-icons/ci"
import { FiCreditCard, FiEdit3 } from "react-icons/fi"

const isValidDiscountId = ({ customerIdNumber, customerTypeId }) => {
  void customerTypeId

  return /^[A-Z0-9-]{3,}$/.test(customerIdNumber)
}

const defaultManualForm = {
  idNumber: "",
  fullName: "",
  address: "",
  birthDate: "",
  sex: "",
  dateIssued: "",
  issuedBy: "",
  disabilityCategory: "",
}

const defaultIssuerOptions = [
  {
    id: "osca-bacacay",
    customerTypeId: "Senior",
    name: "OSCA Bacacay, Albay",
  },
  {
    id: "pdao-bacacay",
    customerTypeId: "PWD",
    name: "PDAO Bacacay, Albay",
  },
]

const getTodayDateInputValue = () => new Date().toISOString().slice(0, 10)

const getAgeFromBirthDate = (birthDate) => {
  if (!birthDate) {
    return ""
  }

  const today = new Date()
  const birth = new Date(`${birthDate}T00:00:00`)

  if (Number.isNaN(birth.getTime()) || birth > today) {
    return ""
  }

  let age = today.getFullYear() - birth.getFullYear()
  const hasBirthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate())

  if (!hasBirthdayPassed) {
    age -= 1
  }

  return String(age)
}

function CustomerDiscountIdModal({
  customerTypeId,
  customerTypeLabel,
  onClose,
  onVerify,
}) {
  const [verificationMode, setVerificationMode] = useState("scan")
  const [customerIdNumber, setCustomerIdNumber] = useState("")
  const [manualForm, setManualForm] = useState(defaultManualForm)
  const [isIssuerSuggestionsOpen, setIsIssuerSuggestionsOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const inputRef = useRef(null)
  const todayDate = getTodayDateInputValue()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const discountCardTitle =
    customerTypeId === "PWD"
      ? "Lyfe PWD Discount Card"
      : "Lyfe Senior Discount Card"
  const customerIdLabel = customerTypeId === "PWD" ? "PWD ID" : "OSCA ID No."
  const manualCustomerIdLabel =
    customerTypeId === "PWD" ? "PWD ID" : "OSCA ID No."
  const manualEntryLabel =
    customerTypeId === "PWD" ? "PWD Details" : "Senior Details"
  const manualAge = useMemo(
    () => getAgeFromBirthDate(manualForm.birthDate),
    [manualForm.birthDate]
  )
  const issuerOptions = useMemo(
    () =>
      defaultIssuerOptions.filter(
        (issuerOption) => issuerOption.customerTypeId === customerTypeId
      ),
    [customerTypeId]
  )
  const filteredIssuerOptions = useMemo(() => {
    const normalizedIssuedBy = manualForm.issuedBy.trim().toLowerCase()

    if (!normalizedIssuedBy) {
      return issuerOptions
    }

    return issuerOptions.filter((issuerOption) =>
      issuerOption.name.toLowerCase().includes(normalizedIssuedBy)
    )
  }, [issuerOptions, manualForm.issuedBy])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  const updateManualForm = (field, value) => {
    setManualForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
    setStatusMessage("")
  }

  const selectIssuer = (issuerName) => {
    updateManualForm("issuedBy", issuerName)
    setIsIssuerSuggestionsOpen(false)
  }

  const handleVerifyScan = () => {
    const normalizedCustomerId = customerIdNumber.trim().toUpperCase()

    if (!normalizedCustomerId) {
      setStatusMessage(`Scan or enter ${customerIdLabel}`)
      return
    }

    if (
      !isValidDiscountId({
        customerIdNumber: normalizedCustomerId,
        customerTypeId,
      })
    ) {
      setStatusMessage(`This is not a valid ${customerTypeLabel} ID`)
      return
    }

    onVerify({
      verificationMethod: "scanned",
      customerIdNumber: normalizedCustomerId,
      details: {},
    })
  }

  const handleVerifyManual = () => {
    const normalizedIdNumber = manualForm.idNumber.trim().toUpperCase()
    const requiredFields = [
      ["idNumber", manualCustomerIdLabel],
      ["fullName", "full name"],
      ["address", "address"],
      ["birthDate", "date of birth"],
      ["sex", "sex"],
      ["dateIssued", "date issued"],
      ["issuedBy", "issued by"],
    ]
    const missingField = requiredFields.find(([field]) => {
      const value = field === "idNumber" ? normalizedIdNumber : manualForm[field]

      return !String(value ?? "").trim()
    })

    if (missingField) {
      setStatusMessage(`Enter the ${missingField[1]}.`)
      return
    }

    if (!manualAge) {
      setStatusMessage("Enter a valid date of birth.")
      return
    }

    onVerify({
      verificationMethod: "manual",
      customerIdNumber: normalizedIdNumber,
      details: {
        idNumber: normalizedIdNumber,
        fullName: manualForm.fullName.trim(),
        address: manualForm.address.trim(),
        birthDate: manualForm.birthDate,
        age: manualAge,
        sex: manualForm.sex,
        dateIssued: manualForm.dateIssued,
        issuedBy: manualForm.issuedBy.trim(),
        ...(customerTypeId === "PWD"
          ? { disabilityCategory: manualForm.disabilityCategory.trim() }
          : {}),
      },
    })
  }

  const handleVerify = () => {
    if (verificationMode === "manual") {
      handleVerifyManual()
      return
    }

    handleVerifyScan()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="flex min-h-full w-full items-center justify-center py-6">
        <section className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]">
        <div className="p-6 sm:p-8">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-[#00675b]">
              <FiCreditCard className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-slate-950">
              {discountCardTitle}
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Scan or enter the {customerIdLabel} before applying the discount.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {[
              { id: "scan", label: "Scan ID", icon: CiBarcode },
              { id: "manual", label: manualEntryLabel, icon: FiEdit3 },
            ].map((mode) => {
              const Icon = mode.icon
              const isSelected = verificationMode === mode.id

              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setVerificationMode(mode.id)
                    setStatusMessage("")
                  }}
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-extrabold transition ${
                    isSelected
                      ? "bg-white text-[#00675b] shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {mode.label}
                </button>
              )
            })}
          </div>

          {verificationMode === "scan" ? (
            <label className="relative mt-8 block">
              <span className="sr-only">
                Scan or enter {customerIdLabel}
              </span>
              <input
                ref={inputRef}
                type="search"
                value={customerIdNumber}
                onChange={(event) => {
                  setCustomerIdNumber(event.target.value)
                  setStatusMessage("")
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    handleVerify()
                  }
                }}
                placeholder={`Scan/Enter ${customerIdLabel}...`}
                className="h-16 w-full rounded-2xl border border-slate-200 bg-white px-5 pl-14 text-lg font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
              />
              <CiBarcode className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400" />
            </label>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-600">
              {manualCustomerIdLabel}
              <input
                value={manualForm.idNumber}
                onChange={(event) =>
                  updateManualForm("idNumber", event.target.value)
                }
                placeholder={`Enter ${manualCustomerIdLabel}`}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
              />
            </label>

            <label className="block text-sm font-bold text-slate-600">
              Full Name
              <input
                value={manualForm.fullName}
                onChange={(event) =>
                  updateManualForm("fullName", event.target.value)
                }
                placeholder="Enter full name"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
              />
            </label>

            <label className="block text-sm font-bold text-slate-600 sm:col-span-2">
              Address
              <input
                value={manualForm.address}
                onChange={(event) =>
                  updateManualForm("address", event.target.value)
                }
                placeholder="Enter address"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
              />
            </label>

            <label className="block text-sm font-bold text-slate-600">
              Date of Birth
              <input
                type="date"
                max={todayDate}
                value={manualForm.birthDate}
                onChange={(event) =>
                  updateManualForm("birthDate", event.target.value)
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
              />
            </label>

            <label className="block text-sm font-bold text-slate-600">
              Age
              <input
                value={manualAge}
                readOnly
                placeholder="Auto"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none"
              />
            </label>

            <label className="block text-sm font-bold text-slate-600">
              Sex
              <select
                value={manualForm.sex}
                onChange={(event) => updateManualForm("sex", event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
              >
                <option value="">Select sex</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </label>

            <label className="block text-sm font-bold text-slate-600">
              Date Issued
              <input
                type="date"
                max={todayDate}
                value={manualForm.dateIssued}
                onChange={(event) =>
                  updateManualForm("dateIssued", event.target.value)
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
              />
            </label>

            {customerTypeId === "PWD" && (
              <label className="block text-sm font-bold text-slate-600">
                Disability / Category
                <input
                  value={manualForm.disabilityCategory}
                  onChange={(event) =>
                    updateManualForm("disabilityCategory", event.target.value)
                  }
                  placeholder="Enter disability/category"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
                />
              </label>
            )}

            <label className="relative block text-sm font-bold text-slate-600 sm:col-span-2">
              Issued By / Municipality or Office
              <input
                value={manualForm.issuedBy}
                onChange={(event) =>
                  updateManualForm("issuedBy", event.target.value)
                }
                onFocus={() => setIsIssuerSuggestionsOpen(true)}
                onBlur={() => {
                  window.setTimeout(() => setIsIssuerSuggestionsOpen(false), 120)
                }}
                placeholder={
                  customerTypeId === "PWD"
                    ? "Search PDAO or issuing office"
                    : "Search OSCA or issuing office"
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
              />
              {isIssuerSuggestionsOpen && (
                <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.14)]">
                  {filteredIssuerOptions.length ? (
                    filteredIssuerOptions.map((issuerOption) => (
                      <button
                        key={issuerOption.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectIssuer(issuerOption.name)}
                        className="block w-full px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-emerald-50 hover:text-[#00675b]"
                      >
                        {issuerOption.name}
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-3 text-sm font-bold text-slate-500">
                      Press Tab to keep typed office
                    </p>
                  )}
                </div>
              )}
            </label>
          </div>
        )}

        {statusMessage && (
          <p className="mt-3 text-center text-sm font-bold text-red-500">
            {statusMessage}
          </p>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleVerify}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#00675b] px-8 text-sm font-extrabold text-white transition hover:bg-[#005348]"
          >
            {verificationMode === "manual" ? "Apply Discount" : "Verify ID"}
          </button>
        </div>
        </div>
        </section>
      </div>
    </div>
  )
}

export default CustomerDiscountIdModal
