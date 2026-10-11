import { useState } from "react"
import { CiBarcode } from "react-icons/ci"
import { FiCalendar, FiImage, FiInfo, FiPlus, FiTrash2, FiX } from "react-icons/fi"

import useNotification from "../../../../../../hooks/useNotification"
import { computeUnitSellingPrice, defaultAdditionalBaseUnit, defaultAddItemForm, defaultBaseUnit, defaultBrandOptions, defaultCategoryOptions, defaultDosageFormOptions, defaultItemUnitOptions, defaultStrengthOptions, getBaseUnitsFromInventoryItem, getFormDataFromInventoryItem, getTodayDateInputValue, isBlank } from "../utils/inventoryModuleUtils"
import { ModalField, PriceInput, SelectInput, TextInput, WholeNumberInput } from "./InventoryFormControls"
import { ManageBrandModal, ManageCategoryModal, ManageDosageFormModal, ManageItemUnitModal, ManageStrengthModal } from "./ManageInventoryOptionModals"

export function AddItemModal({
  activeBranchId,
  centerInMainContent = false,
  hideManageActions = false,
  hideQuantityField = false,
  itemToEdit,
  onClose,
  onAddItem,
  onUpdateItem,
}) {
  const { showWarning } = useNotification()
  const isEditMode = Boolean(itemToEdit)
  const [formData, setFormData] = useState(() =>
    itemToEdit ? getFormDataFromInventoryItem(itemToEdit) : defaultAddItemForm
  )
  const [baseUnits, setBaseUnits] = useState(() =>
    itemToEdit ? getBaseUnitsFromInventoryItem(itemToEdit) : [defaultBaseUnit]
  )
  const [brandOptions, setBrandOptions] = useState(defaultBrandOptions)
  const [categoryOptions, setCategoryOptions] = useState(defaultCategoryOptions)
  const [dosageFormOptions, setDosageFormOptions] = useState(defaultDosageFormOptions)
  const [itemUnitOptions, setItemUnitOptions] = useState(defaultItemUnitOptions)
  const [strengthOptions, setStrengthOptions] = useState(defaultStrengthOptions)
  const [isManageBrandOpen, setIsManageBrandOpen] = useState(false)
  const [isManageCategoryOpen, setIsManageCategoryOpen] = useState(false)
  const [isManageDosageFormOpen, setIsManageDosageFormOpen] = useState(false)
  const [isManageItemUnitOpen, setIsManageItemUnitOpen] = useState(false)
  const [isManageStrengthOpen, setIsManageStrengthOpen] = useState(false)
  const [dateError, setDateError] = useState("")
  const todayDate = getTodayDateInputValue()
  const branchIdForMock = activeBranchId ?? "branch-camalig-albay"
  const withBranchStatus = (option) => ({
    ...option,
    branchId: option.branchId ?? branchIdForMock,
  })

  const updateField = (field, value) => {
    if (
      ["dateReceived", "expiryDate"].includes(field) &&
      value &&
      value < todayDate
    ) {
      setDateError("Past dates are not allowed.")
      return
    }

    if (field === "noExpiration" || field === "dateReceived" || field === "expiryDate") {
      setDateError("")
    }

    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }))
  }

  const updateBaseUnit = (unitId, field, value) => {
    setBaseUnits((currentUnits) => {
      const updatedUnits = currentUnits.map((unit, index) => {
        if (unit.id !== unitId) {
          return unit
        }

        if (index === 0) {
          return {
            ...unit,
            itemUnit: "Piece",
            conversionFactor: "1",
            ...(field === "sellingPrice" ? { sellingPrice: value } : {}),
          }
        }

        return { ...unit, [field]: value }
      })
      const pieceSellingPrice = updatedUnits[0]?.sellingPrice ?? ""

      return updatedUnits.map((unit, index) =>
        index === 0
          ? { ...unit, itemUnit: "Piece", conversionFactor: "1" }
          : {
              ...unit,
              sellingPrice: computeUnitSellingPrice(
                pieceSellingPrice,
                unit.conversionFactor
              ),
            }
      )
    })
  }

  const handleAddBaseUnit = () => {
    setBaseUnits((currentUnits) => [
      ...currentUnits,
      {
        ...defaultAdditionalBaseUnit,
        id: `base-unit-${Date.now()}`,
        sellingPrice: computeUnitSellingPrice(
          currentUnits[0]?.sellingPrice ?? "",
          defaultAdditionalBaseUnit.conversionFactor
        ),
      },
    ])
  }

  const handleRemoveBaseUnit = (unitId) => {
    setBaseUnits((currentUnits) =>
      currentUnits.length === 1
        ? currentUnits
        : currentUnits.filter((unit) => unit.id !== unitId)
    )
  }
  const handleAddBrand = (newBrand) => {
    setBrandOptions((currentBrands) => [
      ...currentBrands,
      withBranchStatus(newBrand),
    ])
  }

  const handleUpdateBrand = (updatedBrand, previousBrandName) => {
    const branchBrand = withBranchStatus(updatedBrand)

    setBrandOptions((currentBrands) =>
      currentBrands.map((brand) =>
        brand.id === branchBrand.id ? branchBrand : brand
      )
    )

    if (formData.brand === previousBrandName) {
      updateField("brand", updatedBrand.name)
    }
  }

  const handleArchiveBrand = (brandToArchive) => {
    setBrandOptions((currentBrands) =>
      currentBrands.filter((brand) => brand.id !== brandToArchive.id)
    )

    if (formData.brand === brandToArchive.name) {
      updateField("brand", "")
    }
  }

  const handleAddCategory = (newCategory) => {
    setCategoryOptions((currentCategories) => [
      ...currentCategories,
      withBranchStatus(newCategory),
    ])
  }

  const handleUpdateCategory = (updatedCategory, previousCategoryName) => {
    const branchCategory = withBranchStatus(updatedCategory)

    setCategoryOptions((currentCategories) =>
      currentCategories.map((category) =>
        category.id === branchCategory.id ? branchCategory : category
      )
    )

    if (formData.category === previousCategoryName) {
      updateField("category", updatedCategory.name)
    }
  }

  const handleArchiveCategory = (categoryToArchive) => {
    setCategoryOptions((currentCategories) =>
      currentCategories.filter((category) => category.id !== categoryToArchive.id)
    )

    if (formData.category === categoryToArchive.name) {
      updateField("category", "")
    }
  }

  const handleAddDosageForm = (newDosageForm) => {
    setDosageFormOptions((currentDosageForms) => [
      ...currentDosageForms,
      withBranchStatus(newDosageForm),
    ])
  }

  const handleUpdateDosageForm = (
    updatedDosageForm,
    previousDosageFormName
  ) => {
    const branchDosageForm = withBranchStatus(updatedDosageForm)

    setDosageFormOptions((currentDosageForms) =>
      currentDosageForms.map((dosageForm) =>
        dosageForm.id === branchDosageForm.id
          ? branchDosageForm
          : dosageForm
      )
    )

    if (formData.dosageForm === previousDosageFormName) {
      updateField("dosageForm", updatedDosageForm.name)
    }
  }

  const handleArchiveDosageForm = (dosageFormToArchive) => {
    setDosageFormOptions((currentDosageForms) =>
      currentDosageForms.filter(
        (dosageForm) => dosageForm.id !== dosageFormToArchive.id
      )
    )

    if (formData.dosageForm === dosageFormToArchive.name) {
      updateField("dosageForm", "")
    }
  }

  const handleAddItemUnit = (newItemUnit) => {
    setItemUnitOptions((currentItemUnits) => [
      ...currentItemUnits,
      withBranchStatus(newItemUnit),
    ])
  }

  const handleUpdateItemUnit = (updatedItemUnit, previousItemUnitName) => {
    const branchItemUnit = withBranchStatus(updatedItemUnit)

    setItemUnitOptions((currentItemUnits) =>
      currentItemUnits.map((itemUnit) =>
        itemUnit.id === branchItemUnit.id ? branchItemUnit : itemUnit
      )
    )

    setBaseUnits((currentUnits) =>
      currentUnits.map((unit, index) =>
        index > 0 && unit.itemUnit === previousItemUnitName
          ? { ...unit, itemUnit: branchItemUnit.name }
          : unit
      )
    )
  }

  const handleArchiveItemUnit = (itemUnitToArchive) => {
    setItemUnitOptions((currentItemUnits) =>
      currentItemUnits.filter((itemUnit) => itemUnit.id !== itemUnitToArchive.id)
    )

    setBaseUnits((currentUnits) =>
      currentUnits.map((unit, index) =>
        index > 0 && unit.itemUnit === itemUnitToArchive.name
          ? { ...unit, itemUnit: "" }
          : unit
      )
    )
  }

  const handleAddStrengths = (newStrengths) => {
    setStrengthOptions((currentStrengths) => [
      ...currentStrengths,
      ...newStrengths.map(withBranchStatus),
    ])
  }

  const handleUpdateStrength = (updatedStrength, previousStrengthName) => {
    const branchStrength = withBranchStatus(updatedStrength)

    setStrengthOptions((currentStrengths) =>
      currentStrengths.map((strength) =>
        strength.id === branchStrength.id ? branchStrength : strength
      )
    )

    if (formData.strength === previousStrengthName) {
      updateField("strength", updatedStrength.name)
    }
  }

  const handleArchiveStrength = (strengthToArchive) => {
    setStrengthOptions((currentStrengths) =>
      currentStrengths.filter((strength) => strength.id !== strengthToArchive.id)
    )

    if (formData.strength === strengthToArchive.name) {
      updateField("strength", "")
    }
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    updateField("image", URL.createObjectURL(file))
  }

  const hasCompleteRequiredFields = () => {
    const requiredFields = [
      "barcode",
      "productName",
      "brand",
      "category",
      "dosageForm",
      "strength",
      "costPrice",
      "supplier",
    ]

    if (isEditMode) {
      requiredFields.push("reorderPoint")
    }

    if (!isEditMode && !hideQuantityField) {
      requiredFields.push("dateReceived", "quantity")
    }

    if (!isEditMode && !formData.noExpiration) {
      requiredFields.push("expiryDate")
    }

    const hasMissingFormField = requiredFields.some((field) =>
      isBlank(formData[field])
    )
    const hasMissingBaseUnitField = baseUnits.some((unit) =>
      ["itemUnit", "conversionFactor", "sellingPrice"].some((field) =>
        isBlank(unit[field])
      )
    )

    return !hasMissingFormField && !hasMissingBaseUnitField
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const productName = formData.productName.trim()

    if (!hasCompleteRequiredFields()) {
      showWarning("Missing items")
      return
    }

    if (!productName) {
      return
    }

    if (
      !isEditMode &&
      formData.dateReceived &&
      formData.dateReceived < todayDate
    ) {
      setDateError("Date received cannot be in the past.")
      return
    }

    if (
      !isEditMode &&
      !formData.noExpiration &&
      formData.expiryDate &&
      formData.expiryDate < todayDate
    ) {
      setDateError("Expiration date cannot be in the past.")
      return
    }

    const primaryBaseUnit = baseUnits[0]
    const selectedCategoryOption = categoryOptions.find(
      (category) => category.name === formData.category
    )
    const initialBatch = {
      id: `${itemToEdit?.id ?? `med-${Date.now()}`}-batch-1`,
      batchNumber: itemToEdit?.batchNumber ?? `20260524-001`,
      quantity: Number(formData.quantity) || 0,
      expiryDate: formData.noExpiration
        ? "2099-12-31"
        : formData.expiryDate || "2099-12-31",
      status: "Active",
    }
    const inventoryItem = {
      ...(itemToEdit ?? {}),
      id: itemToEdit?.id ?? initialBatch.id.replace("-batch-1", ""),
      branchId: activeBranchId ?? itemToEdit?.branchId ?? branchIdForMock,
      productName,
      genericName: formData.description.trim() || productName,
      description: formData.description.trim(),
      batchNumber: itemToEdit?.batchNumber ?? initialBatch.batchNumber,
      dosageForm: formData.dosageForm || "N/A",
      strength: formData.strength,
      brand: formData.brand || "Unassigned",
      category: formData.category || "Uncategorized",
      categoryIsMedicine:
        selectedCategoryOption?.isMedicine ?? itemToEdit?.categoryIsMedicine ?? false,
      itemUnit: primaryBaseUnit.itemUnit,
      quantity: Number(formData.quantity) || 0,
      reorderPoint: Number(formData.reorderPoint) || 0,
      dateReceived: formData.dateReceived,
      expiryDate: formData.noExpiration
        ? "2099-12-31"
        : formData.expiryDate || "2099-12-31",
      noExpiration: formData.noExpiration,
      supplier: formData.supplier || "Unassigned",
      barcode: formData.barcode || "Pending",
      costPrice: Number(formData.costPrice) || 0,
      sellingPrice: Number(primaryBaseUnit.sellingPrice) || 0,
      isPwdSeniorDiscountable: Boolean(formData.isPwdSeniorDiscountable),
      batches: itemToEdit?.batches ?? [initialBatch],
      baseUnits: baseUnits.map((unit, index) => ({
        ...unit,
        itemUnit: index === 0 ? "Piece" : unit.itemUnit,
        conversionFactor: index === 0 ? "1" : unit.conversionFactor,
      })),
      image: formData.image,
      imageTone: formData.imageTone,
    }
    if (isEditMode) {
      onUpdateItem(inventoryItem)
    } else {
      onAddItem(inventoryItem)
    }

    onClose()
  }

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-6 backdrop-blur-[2px] ${centerInMainContent ? "left-0 lg:left-[210px] xl:left-[250px]" : "left-0"}`}
      onMouseDown={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.28)] sm:p-8"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditMode ? "Update Item" : "Add New Item"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#0b6b51]/35 hover:text-[#0b6b51]"
            aria-label={`Close ${isEditMode ? "update" : "add"} item modal`}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <ModalField label="Product Image">
            <label className="grid h-36 cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 text-center transition hover:border-[#0b6b51]/40 hover:bg-emerald-50/30">
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="sr-only"
                onChange={handleImageChange}
              />
              {formData.image ? (
                <img
                  src={formData.image}
                  alt="Product preview"
                  className="h-full max-h-full w-full max-w-full object-contain"
                />
              ) : (
                <span className="text-slate-500">
                  <FiImage className="mx-auto h-10 w-10 text-slate-400" />
                  <span className="mt-3 block text-sm font-bold">
                    Upload Image
                  </span>
                  <span className="mt-1 block text-xs font-semibold">
                    PNG, JPG up to 2MB
                  </span>
                </span>
              )}
            </label>
          </ModalField>

          <div>
            <ModalField label="Barcode">
              <TextInput
                icon={CiBarcode}
                value={formData.barcode}
                onChange={(event) => updateField("barcode", event.target.value)}
                placeholder="Scan or enter barcode"
              />
            </ModalField>
            <div className="mt-4 flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-[#0b6b51]">
              <FiInfo className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Tip: You can scan the barcode using your scanner or enter it
                manually.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <ModalField label="Product Name">
            <TextInput
              value={formData.productName}
              onChange={(event) =>
                updateField("productName", event.target.value)
              }
              placeholder="e.g. Biogesic"
              required
            />
          </ModalField>

          <ModalField label="Brand">
            <SelectInput
              manageLabel={hideManageActions ? undefined : "Manage Brand"}
              onManageClick={hideManageActions ? undefined : () => setIsManageBrandOpen(true)}
              value={formData.brand}
              onChange={(event) => updateField("brand", event.target.value)}
            >
              <option value="">Select brand name</option>
              {brandOptions
                .filter((brand) => brand.status === "Active")
                .map((brand) => (
                  <option key={brand.id} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
            </SelectInput>
          </ModalField>

          <ModalField label="Category">
            <SelectInput
              manageLabel={hideManageActions ? undefined : "Manage Categories"}
              onManageClick={hideManageActions ? undefined : () => setIsManageCategoryOpen(true)}
              value={formData.category}
              onChange={(event) => updateField("category", event.target.value)}
            >
              <option value="">Select category</option>
              {categoryOptions
                .filter((category) => category.status === "Active")
                .map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
            </SelectInput>
          </ModalField>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <ModalField label="Type">
            <SelectInput
              manageLabel={hideManageActions ? undefined : "Manage Types"}
              onManageClick={hideManageActions ? undefined : () => setIsManageDosageFormOpen(true)}
              value={formData.dosageForm}
              onChange={(event) =>
                updateField("dosageForm", event.target.value)
              }
            >
              <option value="">Select type</option>
              {dosageFormOptions
                .filter((dosageForm) => dosageForm.status === "Active")
                .map((dosageForm) => (
                  <option key={dosageForm.id} value={dosageForm.name}>
                    {dosageForm.name}
                  </option>
                ))}
            </SelectInput>
          </ModalField>

          <ModalField label="Strength">
            <SelectInput
              manageLabel={hideManageActions ? undefined : "Manage Strength"}
              onManageClick={hideManageActions ? undefined : () => setIsManageStrengthOpen(true)}
              value={formData.strength}
              onChange={(event) => updateField("strength", event.target.value)}
            >
              <option value="">Select strength</option>
              {strengthOptions
                .filter((strength) => strength.status === "Active")
                .map((strength) => (
                  <option key={strength.id} value={strength.name}>
                    {strength.name}
                  </option>
                ))}
            </SelectInput>
          </ModalField>
        </div>

        <ModalField
          label="Applicable for PWD/Senior Discount?"
          className="mt-5"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ].map((option) => {
              const isSelected =
                formData.isPwdSeniorDiscountable === option.value

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() =>
                    updateField("isPwdSeniorDiscountable", option.value)
                  }
                  className={`h-11 rounded-xl border text-sm font-extrabold transition ${
                    isSelected
                      ? "border-[#00675b] bg-[#00675b] text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#0b6b51]/35"
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </ModalField>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-slate-900">Base Units</h3>
          <button
            type="button"
            onClick={handleAddBaseUnit}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#0b6b51]/55 bg-white px-4 text-sm font-bold text-[#0b6b51] transition hover:bg-[#f2fbf7]"
          >
            <FiPlus className="h-4 w-4" />
            Add Unit
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {baseUnits.map((unit, index) => (
            <div
              key={unit.id}
              className="grid gap-5 rounded-2xl border border-slate-100 bg-slate-50/40 p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <ModalField label="Item Unit">
                {index === 0 ? (
                  <TextInput value="Piece" disabled />
                ) : (
                  <SelectInput
                    manageLabel={hideManageActions ? undefined : "Manage Item Unit"}
                    onManageClick={hideManageActions ? undefined : () => setIsManageItemUnitOpen(true)}
                    value={unit.itemUnit}
                    onChange={(event) =>
                      updateBaseUnit(unit.id, "itemUnit", event.target.value)
                    }
                  >
                    <option value="">Select item unit</option>
                    {itemUnitOptions
                      .filter((itemUnit) => itemUnit.status === "Active")
                      .map((itemUnit) => (
                        <option key={itemUnit.id} value={itemUnit.name}>
                          {itemUnit.name}
                        </option>
                      ))}
                  </SelectInput>
                )}
              </ModalField>

              <ModalField label="Conversion Factor">
                <WholeNumberInput
                  value={unit.conversionFactor}
                  onChange={(event) =>
                    updateBaseUnit(
                      unit.id,
                      "conversionFactor",
                      event.target.value
                    )
                  }
                  placeholder="e.g. 1, 10, 100"
                  disabled={index === 0}
                />
              </ModalField>

              <ModalField label="Selling Price">
                <PriceInput
                  value={unit.sellingPrice}
                  onChange={(event) =>
                    updateBaseUnit(unit.id, "sellingPrice", event.target.value)
                  }
                  placeholder="0.00"
                  disabled={index > 0}
                />
              </ModalField>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemoveBaseUnit(unit.id)}
                  className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  <FiTrash2 className="h-4 w-4" />
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <ModalField label="Date Received">
            <TextInput
              type="date"
              icon={FiCalendar}
              min={todayDate}
              value={formData.dateReceived}
              disabled={isEditMode}
              onChange={(event) =>
                updateField("dateReceived", event.target.value)
              }
            />
          </ModalField>

          <div>
            <ModalField label="Expiration Date">
              <TextInput
                type="date"
                icon={FiCalendar}
                min={todayDate}
                value={formData.expiryDate}
                disabled={isEditMode || formData.noExpiration}
                onChange={(event) =>
                  updateField("expiryDate", event.target.value)
                }
              />
            </ModalField>
            <label className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-700">
              <input
                type="checkbox"
                checked={formData.noExpiration}
                disabled={isEditMode}
                onChange={(event) =>
                  updateField("noExpiration", event.target.checked)
                }
                className="h-4 w-4 rounded border-slate-300 accent-[#0b6b51] disabled:cursor-not-allowed disabled:opacity-50"
              />
              No expiration
            </label>
          </div>

          {isEditMode && (
            <ModalField label="Reorder Point">
              <WholeNumberInput
                value={formData.reorderPoint}
                onChange={(event) =>
                  updateField("reorderPoint", event.target.value)
                }
                placeholder="0"
              />
            </ModalField>
          )}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {!hideQuantityField && (
            <ModalField label="Quantity">
              <WholeNumberInput
                value={formData.quantity}
                onChange={(event) => updateField("quantity", event.target.value)}
                placeholder="0"
                disabled={isEditMode}
              />
            </ModalField>
          )}

          <ModalField label="Cost Price">
            <PriceInput
              value={formData.costPrice}
              onChange={(event) => updateField("costPrice", event.target.value)}
              placeholder="0.00"
            />
          </ModalField>

          <ModalField label="Supplier">
            <SelectInput
              value={formData.supplier}
              onChange={(event) => updateField("supplier", event.target.value)} >
              <option value="">Select supplier</option>
              <option value="Zuellig Pharma">Zuellig Pharma</option>
            </SelectInput>
          </ModalField>
        </div>

        {dateError && (
          <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {dateError}
          </p>
        )}

        <ModalField label="Description" className="mt-5">
          <textarea
            value={formData.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="e.g. Prescription meds, usage, notes..."
            className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
          />
        </ModalField>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-slate-200 bg-white px-7 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 rounded-xl bg-[#00675b] px-7 text-sm font-bold text-white shadow-sm transition hover:bg-[#005348]"
          >
            {isEditMode ? "Update Item" : "Add Item"}
          </button>
        </div>
      </form>

      {isManageBrandOpen && (
        <ManageBrandModal
          activeBranchId={activeBranchId}
          brands={brandOptions}
          onClose={() => setIsManageBrandOpen(false)}
          onAddBrand={handleAddBrand}
          onUpdateBrand={handleUpdateBrand}
          onArchiveBrand={handleArchiveBrand}
        />
      )}

      {isManageCategoryOpen && (
        <ManageCategoryModal
          activeBranchId={activeBranchId}
          categories={categoryOptions}
          onClose={() => setIsManageCategoryOpen(false)}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onArchiveCategory={handleArchiveCategory}
        />
      )}

      {isManageDosageFormOpen && (
        <ManageDosageFormModal
          activeBranchId={activeBranchId}
          dosageForms={dosageFormOptions}
          onClose={() => setIsManageDosageFormOpen(false)}
          onAddDosageForm={handleAddDosageForm}
          onUpdateDosageForm={handleUpdateDosageForm}
          onArchiveDosageForm={handleArchiveDosageForm}
        />
      )}

      {isManageItemUnitOpen && (
        <ManageItemUnitModal
          activeBranchId={activeBranchId}
          itemUnits={itemUnitOptions}
          onClose={() => setIsManageItemUnitOpen(false)}
          onAddItemUnit={handleAddItemUnit}
          onUpdateItemUnit={handleUpdateItemUnit}
          onArchiveItemUnit={handleArchiveItemUnit}
        />
      )}

      {isManageStrengthOpen && (
        <ManageStrengthModal
          activeBranchId={activeBranchId}
          strengths={strengthOptions}
          onClose={() => setIsManageStrengthOpen(false)}
          onAddStrengths={handleAddStrengths}
          onUpdateStrength={handleUpdateStrength}
          onArchiveStrength={handleArchiveStrength}
        />
      )}
    </div>
  )
}
