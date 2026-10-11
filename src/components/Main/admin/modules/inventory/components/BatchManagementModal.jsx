import { useMemo, useState } from "react"
import { CiBarcode } from "react-icons/ci"
import { FaBox, FaRegCalendarTimes } from "react-icons/fa"
import { FiCalendar, FiCheck, FiInfo, FiTruck, FiX } from "react-icons/fi"
import { IoMdPricetags } from "react-icons/io"
import { TbReportMoney } from "react-icons/tb"

import useNotification from "../../../../../../hooks/useNotification"
import { formatDate, formatPeso, getActiveBatches, getItemUnitDisplay, getPrimaryBatch, getProductDisplayName } from "../../../../../shared/inventory/inventoryUtils"
import { ModalField, SelectInput, WholeNumberInput } from "./InventoryFormControls"

function BatchManagementRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <div className="flex min-w-0 items-center gap-2 font-semibold text-slate-500">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        {label}
      </div>
      <span className="min-w-0 break-words text-right font-bold text-slate-800">
        {value}
      </span>
    </div>
  )
}

export function BatchManagementModal({
  activeBranchId,
  inventoryItems,
  selectedItem,
  onClose,
  onApplyAdjustment,
}) {
  const { showSuccess, showWarning } = useNotification()
  const selectedProductId = selectedItem?.id ?? ""
  const selectedProduct =
    inventoryItems.find((item) => item.id === selectedProductId) ??
    selectedItem ??
    null
  const activeBatches = useMemo(
    () => (selectedProduct ? getActiveBatches(selectedProduct) : []),
    [selectedProduct]
  )
  const primaryBatch = selectedProduct ? getPrimaryBatch(selectedProduct) : null
  const [requestedBatchId, setRequestedBatchId] = useState(
    primaryBatch?.id ?? activeBatches[0]?.id ?? ""
  )
  const selectedBatchId = activeBatches.some(
    (batch) => batch.id === requestedBatchId
  )
    ? requestedBatchId
    : activeBatches[0]?.id ?? ""
  const [adjustmentType, setAdjustmentType] = useState("add")
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("")
  const [adjustmentReason, setAdjustmentReason] = useState("")
  const selectedBatch =
    activeBatches.find((batch) => batch.id === selectedBatchId) ??
    activeBatches[0] ??
    null

  const formatBatchDate = (dateValue) => (dateValue ? formatDate(dateValue) : "N/A")

  const handleApplyAdjustment = (event) => {
    event.preventDefault()

    if (!selectedBatch) {
      showWarning("Choose a batch first.", {
        title: "Missing batch",
      })
      return
    }

    if (!adjustmentQuantity || Number(adjustmentQuantity) <= 0) {
      showWarning("Enter the quantity to adjust.", {
        title: "Missing quantity",
      })
      return
    }

    if (
      adjustmentType === "deduct" &&
      Number(adjustmentQuantity) > Number(selectedBatch.quantity)
    ) {
      showWarning("Cannot deduct more than available quantity.", {
        title: "Invalid quantity",
      })
      return
    }

    if (!adjustmentReason) {
      showWarning("Choose a reason for the adjustment.", {
        title: "Missing reason",
      })
      return
    }
    onApplyAdjustment({
      branchId: activeBranchId,
      productId: selectedProduct.id,
      batchId: selectedBatch.id,
      adjustmentType,
      quantity: Number(adjustmentQuantity),
      reason: adjustmentReason,
    })

    showSuccess("Batch quantity updated.", {
      title: "Adjustment saved",
    })
    setAdjustmentQuantity("")
    setAdjustmentReason("")
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-6 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <form
        onSubmit={handleApplyAdjustment}
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.28)] sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-[#0b6b51]">
              <FaBox className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Batch Management
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                View and manage batches for a selected product.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-[#0b6b51]"
            aria-label="Close batch management modal"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <ModalField label="Product">
            <div className="flex h-11 w-full items-center rounded-xl border border-slate-200 bg-slate-50 px-4">
              <span className="min-w-0 truncate text-sm font-bold text-slate-800">
                {selectedProduct ? getProductDisplayName(selectedProduct) : "N/A"}
              </span>
            </div>
          </ModalField>

          <ModalField label="Select Batch">
            <SelectInput
              value={selectedBatchId}
              onChange={(event) => setRequestedBatchId(event.target.value)}
              disabled={!selectedProduct || !activeBatches.length}
            >
              <option value="">Select batch</option>
              {activeBatches.map((batch, index) => (
                <option key={batch.id} value={batch.id}>
                  {batch.batchNumber} {index === 0 ? "FEFO" : ""}
                </option>
              ))}
            </SelectInput>
          </ModalField>
        </div>

        <section className="mt-5 flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-[#0b6b51]">
              <FiCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Current FEFO Batch
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-600">
                This batch will be used first when selling (FEFO).
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-100 bg-white px-5 py-3">
              <p className="text-xs font-bold text-slate-500">Batch Number</p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {primaryBatch?.batchNumber ?? "N/A"}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-white px-5 py-3">
              <p className="text-xs font-bold text-slate-500">Expires On</p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {formatBatchDate(primaryBatch?.expiryDate)}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-5">
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <h3 className="text-base font-bold text-slate-900">
              Batch Details
            </h3>
            <div className="mt-5 space-y-4">
              <BatchManagementRow
                icon={CiBarcode}
                label="Batch Number"
                value={selectedBatch?.batchNumber ?? "N/A"}
              />
              <BatchManagementRow
                icon={FaBox}
                label="Quantity Available"
                value={selectedBatch?.quantity ?? 0}
              />
              <BatchManagementRow
                icon={FaRegCalendarTimes}
                label="Expiration Date"
                value={formatBatchDate(selectedBatch?.expiryDate)}
              />
              <BatchManagementRow
                icon={FiCalendar}
                label="Date Received"
                value={formatBatchDate(
                  selectedBatch?.dateReceived ?? selectedProduct?.dateReceived
                )}
              />
              <BatchManagementRow
                icon={FiTruck}
                label="Supplier"
                value={selectedProduct?.supplier ?? "N/A"}
              />
              <BatchManagementRow
                icon={FaBox}
                label="Unit"
                value={selectedProduct ? getItemUnitDisplay(selectedProduct) : "N/A"}
              />
              <BatchManagementRow
                icon={TbReportMoney}
                label="Cost Price"
                value={formatPeso(selectedProduct?.costPrice ?? 0)}
              />
              <BatchManagementRow
                icon={IoMdPricetags}
                label="Selling Price"
                value={formatPeso(selectedProduct?.sellingPrice ?? 0)}
              />
            </div>
          </section>

          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <h3 className="text-base font-bold text-slate-900">
              All Batches for this Product
            </h3>
            <div className="mt-4 space-y-3 md:hidden">
              {activeBatches.map((batch, index) => (
                <button
                  key={batch.id}
                  type="button"
                  onClick={() => setRequestedBatchId(batch.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selectedBatch?.id === batch.id
                      ? "border-[#0b6b51]/35 bg-emerald-50/70"
                      : "border-slate-100 bg-white hover:bg-emerald-50/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {batch.batchNumber}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        Date received:{" "}
                        {formatBatchDate(
                          batch.dateReceived ?? selectedProduct?.dateReceived
                        )}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${
                        index === 0
                          ? "bg-emerald-100 text-[#0b6b51]"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {index === 0 ? "FEFO" : "Next"}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-400">Qty</p>
                      <p className="mt-1 font-bold text-slate-800">
                        {batch.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-400">Exp. Date</p>
                      <p className="mt-1 font-bold text-slate-800">
                        {formatBatchDate(batch.expiryDate)}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-400">Status</p>
                      <p className="mt-1 font-bold text-[#0b6b51]">
                        {batch.status ?? "Active"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              {!activeBatches.length && (
                <div className="grid min-h-32 place-items-center rounded-xl border border-slate-100 text-sm font-semibold text-slate-400">
                  No active batches found.
                </div>
              )}
            </div>

            <div className="mt-4 hidden max-h-64 overflow-auto rounded-xl border border-slate-100 md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Batch Number</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Exp. Date</th>
                    <th className="px-4 py-3">Date Received</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeBatches.map((batch, index) => (
                    <tr
                      key={batch.id}
                      className={`cursor-pointer transition hover:bg-emerald-50/50 ${
                        selectedBatch?.id === batch.id ? "bg-emerald-50/70" : ""
                      }`}
                      onClick={() => setRequestedBatchId(batch.id)}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {batch.batchNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {batch.quantity}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {formatBatchDate(batch.expiryDate)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {formatBatchDate(
                          batch.dateReceived ?? selectedProduct?.dateReceived
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-[#0b6b51]">
                          {batch.status ?? "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-lg px-3 py-1 text-xs font-bold ${
                            index === 0
                              ? "bg-emerald-100 text-[#0b6b51]"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {index === 0 ? "FEFO" : "Next"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!activeBatches.length && (
                <div className="grid min-h-32 place-items-center text-sm font-semibold text-slate-400">
                  No active batches found.
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-base font-bold text-slate-900">Adjust Quantity</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Add or deduct quantity from the selected batch.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_260px] lg:items-end">
            <ModalField label="Adjustment Type">
              <SelectInput
                value={adjustmentType}
                onChange={(event) => setAdjustmentType(event.target.value)}
              >
                <option value="add">Add Quantity</option>
                <option value="deduct">Deduct Quantity</option>
              </SelectInput>
            </ModalField>

            <ModalField label="Quantity">
              <WholeNumberInput
                value={adjustmentQuantity}
                onChange={(event) => setAdjustmentQuantity(event.target.value)}
                placeholder="Enter quantity"
              />
            </ModalField>

            <ModalField label="Reason">
              <SelectInput
                value={adjustmentReason}
                onChange={(event) => setAdjustmentReason(event.target.value)}
              >
                <option value="">Select reason</option>
                <option value="Stock count correction">
                  Stock count correction
                </option>
                <option value="Damaged item">Damaged item</option>
                <option value="Lost item">Lost item</option>
              </SelectInput>
            </ModalField>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-xs font-bold text-[#0b6b51]">
              <FiInfo className="mx-auto mb-1 h-4 w-4" />
              Adjustments will update the available quantity for this batch.
            </div>
          </div>
        </section>

        <div className="mt-7 flex justify-end">
          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#00675b] px-7 text-sm font-bold text-white shadow-sm transition hover:bg-[#005348] sm:w-auto"
          >
            <FiCheck className="h-4 w-4" />
            Apply Adjustment
          </button>
        </div>

      </form>
    </div>
  )
}

