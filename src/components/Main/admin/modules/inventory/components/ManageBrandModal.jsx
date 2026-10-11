import { useState } from "react"
import { FiCheck, FiEdit3, FiGrid, FiPlus, FiX } from "react-icons/fi"

import { ModalField, SelectInput, TextInput } from "./InventoryFormControls"
import { ManageOptionActionMenu } from "./ManageOptionActionMenu"

export function ManageBrandModal({
  activeBranchId,
  brands,
  onClose,
  onAddBrand,
  onUpdateBrand,
  onArchiveBrand,
}) {
  void activeBranchId

  const [selectedBrandId, setSelectedBrandId] = useState(null)
  const [brandName, setBrandName] = useState("")
  const [status, setStatus] = useState("")

  const resetInputs = () => {
    setSelectedBrandId(null)
    setBrandName("")
    setStatus("")
  }

  const handleSelectBrand = (brand) => {
    setSelectedBrandId(brand.id)
    setBrandName(brand.name)
    setStatus(brand.status)
  }

  const handleAddBrand = () => {
    const cleanBrandName = brandName.trim()

    if (!cleanBrandName) {
      return
    }

    onAddBrand({
      id: `brand-${Date.now()}`,
      name: cleanBrandName,
      status: status || "Active",
    })
    resetInputs()
  }

  const handleUpdateBrand = () => {
    const cleanBrandName = brandName.trim()

    if (!selectedBrandId || !cleanBrandName) {
      return
    }

    const previousBrand = brands.find((brand) => brand.id === selectedBrandId)

    onUpdateBrand(
      {
        id: selectedBrandId,
        name: cleanBrandName,
        status: status || "Active",
      },
      previousBrand?.name
    )
    resetInputs()
  }

  const handleArchiveBrand = (brand) => {
    onArchiveBrand(brand)

    if (selectedBrandId === brand.id) {
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
              Manage Brand
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#0b6b51]/35 hover:text-[#0b6b51]"
            aria-label="Close manage brand modal"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-6 text-sm font-extrabold uppercase tracking-wide text-[#0b6b51]">
          Brand List
        </p>

        <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 text-slate-700">
                <th className="px-4 py-3 font-bold">Brand</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-center font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr
                  key={brand.id}
                  onClick={() => handleSelectBrand(brand)}
                  className={`cursor-pointer border-t border-slate-100 transition hover:bg-emerald-50/50 ${
                    selectedBrandId === brand.id ? "bg-emerald-50" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {brand.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-3 py-1 text-xs font-bold ${
                        brand.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {brand.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <ManageOptionActionMenu
                        label={brand.name}
                        onArchive={() => handleArchiveBrand(brand)}
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
            onClick={handleAddBrand}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#00675b] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#005348]"
          >
            <FiPlus className="h-4 w-4" />
            Add Brand
          </button>
          <button
            type="button"
            onClick={handleUpdateBrand}
            disabled={!selectedBrandId}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#0b6b51]/55 bg-white px-5 text-sm font-bold text-[#0b6b51] transition hover:bg-[#f2fbf7] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <FiEdit3 className="h-4 w-4" />
            Update Brand
          </button>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <ModalField label="Brand">
            <TextInput
              value={brandName}
              onChange={(event) => setBrandName(event.target.value)}
              placeholder="Enter brand name"
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
