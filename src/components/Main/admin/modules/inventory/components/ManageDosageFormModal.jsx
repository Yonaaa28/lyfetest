import { useState } from "react"
import { FiCheck, FiEdit3, FiGrid, FiPlus, FiX } from "react-icons/fi"

import { ModalField, SelectInput, TextInput } from "./InventoryFormControls"
import { ManageOptionActionMenu } from "./ManageOptionActionMenu"

export function ManageDosageFormModal({
  activeBranchId,
  dosageForms,
  onClose,
  onAddDosageForm,
  onUpdateDosageForm,
  onArchiveDosageForm,
}) {
  void activeBranchId

  const [selectedDosageFormId, setSelectedDosageFormId] = useState(null)
  const [dosageFormName, setDosageFormName] = useState("")
  const [status, setStatus] = useState("")

  const resetInputs = () => {
    setSelectedDosageFormId(null)
    setDosageFormName("")
    setStatus("")
  }

  const handleSelectDosageForm = (dosageForm) => {
    setSelectedDosageFormId(dosageForm.id)
    setDosageFormName(dosageForm.name)
    setStatus(dosageForm.status)
  }

  const handleAddDosageForm = () => {
    const cleanDosageFormName = dosageFormName.trim()

    if (!cleanDosageFormName) {
      return
    }

    onAddDosageForm({
      id: `dosage-form-${Date.now()}`,
      name: cleanDosageFormName,
      status: status || "Active",
    })
    resetInputs()
  }

  const handleUpdateDosageForm = () => {
    const cleanDosageFormName = dosageFormName.trim()

    if (!selectedDosageFormId || !cleanDosageFormName) {
      return
    }

    const previousDosageForm = dosageForms.find(
      (dosageForm) => dosageForm.id === selectedDosageFormId
    )

    onUpdateDosageForm(
      {
        id: selectedDosageFormId,
        name: cleanDosageFormName,
        status: status || "Active",
      },
      previousDosageForm?.name
    )
    resetInputs()
  }

  const handleArchiveDosageForm = (dosageForm) => {
    onArchiveDosageForm(dosageForm)

    if (selectedDosageFormId === dosageForm.id) {
      resetInputs()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/55 px-4 py-6 backdrop-blur-[2px]"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.28)] sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FiGrid className="h-6 w-6 text-[#0b6b51] sm:h-8 sm:w-8" />
            <h2 className="whitespace-nowrap text-xl font-bold text-slate-900 sm:text-2xl">
              Manage Type
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#0b6b51]/35 hover:text-[#0b6b51]"
            aria-label="Close manage type modal"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-6 text-sm font-extrabold uppercase tracking-wide text-[#0b6b51]">
          Type List
        </p>

        <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 text-slate-700">
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-center font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {dosageForms.map((dosageForm) => (
                <tr
                  key={dosageForm.id}
                  onClick={() => handleSelectDosageForm(dosageForm)}
                  className={`cursor-pointer border-t border-slate-100 transition hover:bg-emerald-50/50 ${
                    selectedDosageFormId === dosageForm.id
                      ? "bg-emerald-50"
                      : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {dosageForm.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-3 py-1 text-xs font-bold ${
                        dosageForm.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {dosageForm.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <ManageOptionActionMenu
                        label={dosageForm.name}
                        onArchive={() => handleArchiveDosageForm(dosageForm)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleAddDosageForm}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#00675b] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#005348]"
          >
            <FiPlus className="h-4 w-4" />
            Add Type
          </button>
          <button
            type="button"
            onClick={handleUpdateDosageForm}
            disabled={!selectedDosageFormId}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#0b6b51]/55 bg-white px-5 text-sm font-bold text-[#0b6b51] transition hover:bg-[#f2fbf7] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <FiEdit3 className="h-4 w-4" />
            Update Type
          </button>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <ModalField label="Type">
            <TextInput
              value={dosageFormName}
              onChange={(event) => setDosageFormName(event.target.value)}
              placeholder="Enter type"
            />
          </ModalField>

          <ModalField label="Status">
            <SelectInput
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">Select status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </SelectInput>
          </ModalField>
        </div>

        <div className="mt-7 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#00675b] px-7 text-sm font-bold text-white shadow-sm transition hover:bg-[#005348]"
          >
            <FiCheck className="h-4 w-4" />
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

