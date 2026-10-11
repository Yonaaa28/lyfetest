import { useState } from "react"
import {
  FiBox,
  FiImage,
  FiMinus,
  FiPlus,
  FiTrash2,
} from "react-icons/fi"

import useNotification from "../../../../../../hooks/useNotification"
import {
  formatDate,
  formatPeso,
  getProductDisplayName,
} from "../../../../../shared/inventory/inventoryUtils"
import { mockInventoryItems } from "../../inventory/data/inventoryMockData"
import {
  getBundleIncludedItemsFromRows,
  getBundleProductRows,
  getInitialBundleProductRow,
  getProductExpiry,
  getProductPrice,
  getRowNetPrice,
} from "../utils/bundleModuleUtils"

function AddBundleModal({
  activeBranchId,
  bundleToEdit = null,
  onClose,
  onCreateBundle,
  onUpdateBundle,
}) {
  const { showWarning, showSuccess } = useNotification()
  const isEditMode = Boolean(bundleToEdit)
  const [bundleName, setBundleName] = useState(bundleToEdit?.name ?? "")
  const [bundleImageFile, setBundleImageFile] = useState(null)
  const [bundleImagePreview, setBundleImagePreview] = useState(
    bundleToEdit?.image ?? ""
  )
  const [barcode, setBarcode] = useState(bundleToEdit?.barcode ?? "")
  const [description, setDescription] = useState(bundleToEdit?.description ?? "")
  const [stock, setStock] = useState(String(bundleToEdit?.stock ?? 0))
  const [productRows, setProductRows] = useState(
    getBundleProductRows(bundleToEdit)
  )

  const totalPrice = productRows.reduce(
    (total, row) => total + getRowNetPrice(row),
    0
  )

  const updateProductRow = (rowId, field, value) => {
    setProductRows((currentRows) =>
      currentRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    )
  }

  const addProductRow = () => {
    setProductRows((currentRows) => [
      ...currentRows,
      getInitialBundleProductRow(`bundle-product-${Date.now()}`),
    ])
  }

  const removeProductRow = (rowId) => {
    setProductRows((currentRows) =>
      currentRows.filter((row) => row.id !== rowId)
    )
  }

  const adjustRowQuantity = (rowId, amount) => {
    setProductRows((currentRows) =>
      currentRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              quantity: Math.max(Number(row.quantity) + amount, 1),
            }
          : row
      )
    )
  }

  const clearDefaultDiscount = (row) => {
    if (Number(row.discount) === 0) {
      updateProductRow(row.id, "discount", "")
    }
  }

  const restoreEmptyDiscount = (row) => {
    if (String(row.discount).trim() === "") {
      updateProductRow(row.id, "discount", 0)
    }
  }

  const adjustStock = (amount) => {
    if (isEditMode) {
      return
    }

    setStock((currentStock) => String(Math.max(Number(currentStock) + amount, 0)))
  }

  const handleBundleImageChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      showWarning("Use JPG or PNG image only.", { title: "Invalid image" })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      showWarning("Image must be 2MB or below.", { title: "Image too large" })
      return
    }

    setBundleImageFile(file)

    const reader = new FileReader()
    reader.onload = () => setBundleImagePreview(String(reader.result))
    reader.readAsDataURL(file)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const selectedRows = productRows.filter((row) => row.productId)

    if (!bundleName.trim()) {
      showWarning("Bundle name is required.", { title: "Missing bundle name" })
      return
    }

    if (!selectedRows.length) {
      showWarning("Choose at least one product.", { title: "Missing products" })
      return
    }

    if (
      selectedRows.length === 1 &&
      Math.max(Number(selectedRows[0].quantity) || 1, 1) <= 1
    ) {
      showWarning("Must be at least 2 products.", {
        title: "Bundle needs more items",
      })
      return
    }

    const includedItems = getBundleIncludedItemsFromRows(selectedRows)
    const mockBundleSlug =
      bundleName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "new-bundle"
    const mockBundleCode = `BND-${mockBundleSlug
      .slice(0, 3)
      .toUpperCase()
      .padEnd(3, "0")}`

    const savedBundle = {
      ...(bundleToEdit ?? {}),
      id: bundleToEdit?.id ?? `bundle-${mockBundleSlug}`,
      branchId:
        bundleToEdit?.branchId ?? activeBranchId ?? "branch-camalig-albay",
      bundleCode: bundleToEdit?.bundleCode ?? mockBundleCode,
      name: bundleName.trim(),
      image: bundleImagePreview || bundleToEdit?.image || "",
      imageFile: bundleImageFile,
      barcode,
      description: description.trim(),
      price: totalPrice,
      stock: isEditMode ? Number(bundleToEdit?.stock) || 0 : Number(stock) || 0,
      status: bundleToEdit?.status ?? "Active",
      createdAt: bundleToEdit?.createdAt ?? new Date().toISOString().slice(0, 10),
      includedItems,
    }
    if (isEditMode) {
      onUpdateBundle(savedBundle)
      showSuccess("Bundle updated.", { title: "Bundle saved" })
    } else {
      onCreateBundle(savedBundle)
      showSuccess("Bundle created.", { title: "Bundle saved" })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-2 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
      <form
        onSubmit={handleSubmit}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)] sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto p-4 sm:max-h-[calc(100dvh-3rem)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-[#0b6b51] sm:h-14 sm:w-14">
              <FiBox className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold leading-tight text-slate-950 sm:text-2xl">
                {isEditMode ? "Update Bundle" : "Add New Bundle"}
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {isEditMode
                  ? "Edit the selected product bundle."
                  : "Create a new product bundle or multipack."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#0b6b51]/40 hover:text-[#0b6b51] sm:h-10 sm:w-10"
            aria-label="Close add bundle modal"
          >
            x
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-7">
          <div>
            <p className="text-sm font-extrabold text-slate-700">
              Bundle Image
            </p>
            <label className="mt-3 grid h-44 cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 text-center transition hover:border-[#0b6b51]/40 hover:bg-emerald-50/30 sm:h-48">
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="sr-only"
                onChange={handleBundleImageChange}
              />
              {bundleImagePreview ? (
                <img
                  src={bundleImagePreview}
                  alt="Bundle preview"
                  className="h-full max-h-full w-full max-w-full object-contain"
                />
              ) : (
                <span>
                  <FiImage className="mx-auto h-10 w-10 text-slate-400" />
                  <span className="mt-3 block text-sm font-extrabold text-slate-500">
                    Upload Image
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-slate-500">
                    JPG, PNG up to 2MB
                  </span>
                </span>
              )}
            </label>
          </div>

          <div>
            <p className="text-sm font-extrabold text-slate-700">Barcode</p>
            <div className="mt-3 flex flex-col gap-3 min-[380px]:flex-row">
              <input
                value={barcode}
                onChange={(event) => setBarcode(event.target.value)}
                placeholder="Enter or scan barcode"
                className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
              />
              <button
                type="button"
                className="h-12 rounded-xl border border-[#0b6b51]/55 bg-white px-5 text-sm font-bold text-[#0b6b51] transition hover:bg-[#f2fbf7] min-[380px]:shrink-0 sm:px-6"
              >
                Generate
              </button>
            </div>
            <textarea
              maxLength={255}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Bundle description (optional)"
              className="mt-4 min-h-28 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            />
            <p className="mt-1 text-right text-xs font-bold text-slate-400">
              {description.length} / 255
            </p>
          </div>
        </div>

        <div className="mt-7 border-t border-slate-200 pt-6">
          <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 sm:text-xl">
              Products
            </h3>
            <button
              type="button"
              onClick={addProductRow}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#0b6b51]/55 bg-white px-4 text-sm font-bold text-[#0b6b51] transition hover:bg-[#f2fbf7]"
            >
              <FiPlus className="h-4 w-4" />
              Add Product
            </button>
          </div>

          <label className="mt-4 block max-w-sm">
            <span className="text-sm font-extrabold text-slate-700">
              Bundle Name
            </span>
            <input
              value={bundleName}
              onChange={(event) => setBundleName(event.target.value)}
              placeholder="e.g., Pain Relief Pack"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
            />
          </label>

          <div className="mt-5 grid gap-4 sm:hidden">
            {productRows.map((row, index) => {
              const selectedProduct = mockInventoryItems.find(
                (item) => item.id === row.productId
              )
              const expiryDate = getProductExpiry(selectedProduct)
              const price = getProductPrice(selectedProduct)
              const netPrice = getRowNetPrice(row)

              return (
                <div
                  key={row.id}
                  className="rounded-2xl border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-extrabold uppercase tracking-[0.03em] text-slate-500">
                      Product {index + 1}
                    </p>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeProductRow(row.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-red-500 transition hover:bg-red-50"
                        aria-label="Remove product row"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <label className="mt-3 block">
                    <span className="text-xs font-extrabold uppercase tracking-[0.03em] text-slate-500">
                      Product
                    </span>
                    <select
                      value={row.productId}
                      onChange={(event) =>
                        updateProductRow(row.id, "productId", event.target.value)
                      }
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
                    >
                      <option value="">Choose a product</option>
                      {mockInventoryItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {getProductDisplayName(item)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="mt-3 grid gap-3">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-[0.03em] text-slate-500">
                        Qty
                      </span>
                      <div className="mt-1 grid h-11 grid-cols-[38px_minmax(0,1fr)_44px] overflow-hidden rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => adjustRowQuantity(row.id, -1)}
                          className="grid place-items-center text-slate-500 transition hover:bg-slate-50 hover:text-[#0b6b51]"
                          aria-label="Decrease product quantity"
                        >
                          <FiMinus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={(event) =>
                            updateProductRow(
                              row.id,
                              "quantity",
                              Math.max(Number(event.target.value) || 1, 1)
                            )
                          }
                          className="border-x border-slate-200 text-center text-sm font-extrabold text-slate-700 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => adjustRowQuantity(row.id, 1)}
                          className="grid place-items-center text-[#0b6b51] transition hover:bg-slate-50"
                          aria-label="Increase product quantity"
                        >
                          <FiPlus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <label className="block">
                      <span className="text-xs font-extrabold uppercase tracking-[0.03em] text-slate-500">
                        Exp. Date
                      </span>
                      <input
                        value={expiryDate ? formatDate(expiryDate) : ""}
                        readOnly
                        className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-500 outline-none"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-extrabold uppercase tracking-[0.03em] text-slate-500">
                        Price
                      </span>
                      <input
                        value={formatPeso(price)}
                        readOnly
                        className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-extrabold uppercase tracking-[0.03em] text-slate-500">
                        Discount
                      </span>
                      <div className="mt-1 flex h-11 items-center overflow-hidden rounded-xl border border-slate-200">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={row.discount}
                          onFocus={() => clearDefaultDiscount(row)}
                          onBlur={() => restoreEmptyDiscount(row)}
                          onChange={(event) =>
                            updateProductRow(
                              row.id,
                              "discount",
                              event.target.value
                            )
                          }
                          className="h-full min-w-0 flex-1 px-3 text-center text-sm font-extrabold text-slate-700 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <span className="pr-3 text-sm font-bold text-slate-500">
                          %
                        </span>
                      </div>
                    </label>

                    <label className="block">
                      <span className="text-xs font-extrabold uppercase tracking-[0.03em] text-slate-500">
                        Net Price
                      </span>
                      <input
                        value={formatPeso(netPrice)}
                        readOnly
                        className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-extrabold text-slate-700 outline-none"
                      />
                    </label>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-5 hidden overflow-x-auto rounded-xl border border-slate-200 sm:block">
            <div className="grid min-w-[920px] grid-cols-[1.45fr_130px_150px_140px_130px_140px_48px] gap-3 bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.02em] text-slate-500">
              <span>Product</span>
              <span>Qty</span>
              <span>Exp. Date</span>
              <span>Price</span>
              <span>Discount</span>
              <span>Net Price</span>
              <span />
            </div>

            <div className="min-w-[920px] divide-y divide-slate-100">
              {productRows.map((row, index) => {
                const selectedProduct = mockInventoryItems.find(
                  (item) => item.id === row.productId
                )
                const expiryDate = getProductExpiry(selectedProduct)
                const price = getProductPrice(selectedProduct)
                const netPrice = getRowNetPrice(row)

                return (
                  <div
                    key={row.id}
                    className="grid grid-cols-[1.45fr_130px_150px_140px_130px_140px_48px] items-center gap-3 px-4 py-4"
                  >
                    <select
                      value={row.productId}
                      onChange={(event) =>
                        updateProductRow(row.id, "productId", event.target.value)
                      }
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"
                    >
                      <option value="">Choose a product</option>
                      {mockInventoryItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {getProductDisplayName(item)}
                        </option>
                      ))}
                    </select>

                    <div className="grid h-11 grid-cols-[38px_minmax(0,1fr)_44px] overflow-hidden rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => adjustRowQuantity(row.id, -1)}
                        className="grid place-items-center text-slate-500 transition hover:bg-slate-50 hover:text-[#0b6b51]"
                        aria-label="Decrease product quantity"
                      >
                        <FiMinus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(event) =>
                          updateProductRow(
                            row.id,
                            "quantity",
                            Math.max(Number(event.target.value) || 1, 1)
                          )
                        }
                        className="border-x border-slate-200 text-center text-sm font-extrabold text-slate-700 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => adjustRowQuantity(row.id, 1)}
                        className="grid place-items-center text-[#0b6b51] transition hover:bg-slate-50"
                        aria-label="Increase product quantity"
                      >
                        <FiPlus className="h-4 w-4" />
                      </button>
                    </div>

                    <input
                      value={expiryDate ? formatDate(expiryDate) : ""}
                      readOnly
                      className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-500 outline-none"
                    />
                    <input
                      value={formatPeso(price)}
                      readOnly
                      className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none"
                    />
                    <div className="flex h-11 items-center overflow-hidden rounded-xl border border-slate-200">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.discount}
                        onFocus={() => clearDefaultDiscount(row)}
                        onBlur={() => restoreEmptyDiscount(row)}
                        onChange={(event) =>
                          updateProductRow(row.id, "discount", event.target.value)
                        }
                        className="h-full min-w-0 flex-1 px-3 text-center text-sm font-extrabold text-slate-700 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <span className="pr-3 text-sm font-bold text-slate-500">
                        %
                      </span>
                    </div>
                    <input
                      value={formatPeso(netPrice)}
                      readOnly
                      className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-extrabold text-slate-700 outline-none"
                    />
                    {index > 0 ? (
                      <button
                        type="button"
                        onClick={() => removeProductRow(row.id)}
                        className="grid h-10 w-10 place-items-center rounded-lg text-red-500 transition hover:bg-red-50"
                        aria-label="Remove product row"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-stretch gap-4 sm:items-end">
          <div className="grid w-full max-w-xs gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-extrabold text-slate-700">Stock</span>
              <div className="grid h-10 w-36 grid-cols-[38px_minmax(0,1fr)_44px] overflow-hidden rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => adjustStock(-1)}
                  disabled={isEditMode}
                  className="grid place-items-center text-slate-500 transition hover:bg-slate-50 hover:text-[#0b6b51] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Decrease bundle stock"
                >
                  <FiMinus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  disabled={isEditMode}
                  onChange={(event) =>
                    setStock(String(Math.max(Number(event.target.value) || 0, 0)))
                  }
                  className="border-x border-slate-200 text-center text-sm font-extrabold text-slate-700 outline-none disabled:bg-slate-50 disabled:text-slate-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => adjustStock(1)}
                  disabled={isEditMode}
                  className="grid place-items-center text-[#0b6b51] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Increase bundle stock"
                >
                  <FiPlus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-extrabold text-slate-700">Total</span>
              <div className="h-12 min-w-40 rounded-xl bg-[#f2fbf7] px-5 py-3 text-right text-lg font-extrabold text-[#0b6b51]">
                {formatPeso(totalPrice)}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#00675b] px-8 text-sm font-bold text-white shadow-sm transition hover:bg-[#005348]"
          >
            <FiBox className="h-5 w-5" />
            {isEditMode ? "Update Bundle" : "Create Bundle"}
          </button>
        </div>
        </div>
      </form>
    </div>
  )
}

export default AddBundleModal
