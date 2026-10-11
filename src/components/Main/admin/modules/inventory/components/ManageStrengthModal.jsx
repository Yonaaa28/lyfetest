import { useState } from "react"
import { FiCheck, FiEdit3, FiGrid, FiPlus, FiTrash2, FiX } from "react-icons/fi"

import { defaultStrengthRow, getStrengthCountDisplay, getStrengthName, getStrengthParts, getStrengthUnitDisplay } from "../utils/inventoryModuleUtils"
import { DecimalInput, ModalField, SelectInput } from "./InventoryFormControls"
import { ManageOptionActionMenu } from "./ManageOptionActionMenu"

export function ManageStrengthModal({
  activeBranchId,
  strengths,
  onClose,
  onAddStrengths,
  onUpdateStrength,
  onArchiveStrength,
}) {
  void activeBranchId

  const [selectedStrengthId, setSelectedStrengthId] = useState(null)
  const [strengthRows, setStrengthRows] = useState([defaultStrengthRow])
  const [status, setStatus] = useState("")

  const resetInputs = () => {
    setSelectedStrengthId(null)
    setStrengthRows([defaultStrengthRow])
    setStatus("")
  }

  const updateStrengthRow = (rowId, field, value) => {
    setStrengthRows((currentRows) =>
      currentRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    )
  }

  const handleAddStrengthRow = () => {
    setStrengthRows((currentRows) => [
      ...currentRows,
      {
        ...defaultStrengthRow,
        id: `strength-row-${Date.now()}`,
      },
    ])
  }

  const handleRemoveStrengthRow = (rowId) => {
    setStrengthRows((currentRows) =>
      currentRows.length === 1
        ? currentRows
        : currentRows.filter((row) => row.id !== rowId)
    )
  }

  const handleSelectStrength = (strength) => {
    setSelectedStrengthId(strength.id)
    setStrengthRows(
      getStrengthParts(strength).map((part, index) => ({
        id: `strength-row-${index + 1}`,
        count: part.count,
        unit: part.unit,
      }))
    )
    setStatus(strength.status)
  }

  const buildStrengthItem = (strengthId) => {
    const parts = strengthRows
      .map((row) => ({
        count: row.count.trim(),
        unit: row.unit.trim(),
      }))
      .filter((row) => row.count && row.unit)

    if (!parts.length) {
      return null
    }

    return {
      id:
        strengthId ??
        `strength-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      count: parts.map((part) => part.count).join("/"),
      unit: parts.map((part) => part.unit).join("/"),
      parts,
      name: getStrengthName(parts),
      status: status || "Active",
    }
  }

  const handleAddStrength = () => {
    const newStrength = buildStrengthItem()

    if (!newStrength) {
      return
    }

    onAddStrengths([newStrength])
    resetInputs()
  }

  const handleUpdateStrength = () => {
    const updatedStrength = buildStrengthItem(selectedStrengthId)

    if (!selectedStrengthId || !updatedStrength) {
      return
    }

    const previousStrength = strengths.find(
      (strength) => strength.id === selectedStrengthId
    )

    onUpdateStrength(
      updatedStrength,
      previousStrength?.name
    )
    resetInputs()
  }

  const handleArchiveStrength = (strength) => {
    onArchiveStrength(strength)

    if (selectedStrengthId === strength.id) {
      resetInputs()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/55 px-4 py-6 backdrop-blur-[2px]"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.28)] sm:p-8">
        <div className="flex shrink-0 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FiGrid className="h-6 w-6 text-[#0b6b51] sm:h-8 sm:w-8" />
            <h2 className="whitespace-nowrap text-xl font-bold text-slate-900 sm:text-2xl">
              Manage Strength
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#0b6b51]/35 hover:text-[#0b6b51]"
            aria-label="Close manage strength modal"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-6 pr-6 [scrollbar-gutter:stable]">
          <p className="text-sm font-extrabold uppercase tracking-wide text-[#0b6b51]">
            Strength List
          </p>

          <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-slate-200 pr-2 [scrollbar-gutter:stable]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 text-slate-700">
                  <th className="px-4 py-3 font-bold">Strength Count</th>
                  <th className="px-4 py-3 font-bold">Unit</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 text-center font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {strengths.map((strength) => (
                  <tr
                    key={strength.id}
                    onClick={() => handleSelectStrength(strength)}
                    className={`cursor-pointer border-t border-slate-100 transition hover:bg-emerald-50/50 ${
                      selectedStrengthId === strength.id
                        ? "bg-emerald-50"
                        : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {getStrengthCountDisplay(strength)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {getStrengthUnitDisplay(strength)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-3 py-1 text-xs font-bold ${
                          strength.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {strength.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <ManageOptionActionMenu
                          label={strength.name}
                          onArchive={() => handleArchiveStrength(strength)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-wrap justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAddStrength}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#00675b] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#005348]"
              >
                <FiPlus className="h-4 w-4" />
                Add
              </button>
              <button
                type="button"
                onClick={handleUpdateStrength}
                disabled={!selectedStrengthId}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#0b6b51]/55 bg-white px-5 text-sm font-bold text-[#0b6b51] transition hover:bg-[#f2fbf7] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <FiEdit3 className="h-4 w-4" />
                Update
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddStrengthRow}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#0b6b51]/55 bg-white px-4 text-sm font-bold text-[#0b6b51] transition hover:bg-[#f2fbf7]"
            >
              <FiPlus className="h-4 w-4" />
              Add Strength
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {strengthRows.map((row, index) => (
              <div
                key={row.id}
                className="grid gap-5 rounded-2xl border border-slate-100 bg-slate-50/40 p-4 md:grid-cols-[1fr_1fr_auto]"
              >
                <ModalField label="Strength Count">
                  <DecimalInput
                    value={row.count}
                    onChange={(event) =>
                      updateStrengthRow(row.id, "count", event.target.value)
                    }
                    placeholder="e.g. 500"
                  />
                </ModalField>

                <ModalField label="Unit">
                  <SelectInput
                    value={row.unit}
                    onChange={(event) =>
                      updateStrengthRow(row.id, "unit", event.target.value)
                    }
                  >
                    <option value="">Select unit</option>
                    <option value="mg">mg</option>
                    <option value="ml">ml</option>
                    <option value="mcg">mcg</option>
                    <option value="g">g</option>
                  </SelectInput>
                </ModalField>

                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStrengthRow(row.id)}
                    className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-600 transition hover:bg-red-50"
                  >
                    <FiTrash2 className="h-4 w-4" />
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
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
        </div>

        <div className="flex shrink-0 justify-end border-t border-slate-100 pt-5">
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

