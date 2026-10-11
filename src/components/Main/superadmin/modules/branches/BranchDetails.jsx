import { useEffect, useState } from "react"
import {
  HiCheckCircle,
  HiOutlineBellAlert,
  HiOutlineBuildingStorefront,
  HiOutlineCurrencyDollar,
  HiOutlinePencilSquare,
  HiOutlineReceiptPercent,
  HiOutlineNoSymbol,
  HiOutlineUsers,
  HiXMark,
} from "react-icons/hi2"

import DeactivateBranchModal from "./DeactivateBranchModal"

function Card({ children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] ${className}`}
    >
      {children}
    </section>
  )
}

function BranchDetails({ administrators = [], branch, onAssignAdministrator, onDeactivate, onEdit }) {
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!showSuccess) return undefined
    const timer = window.setTimeout(() => setShowSuccess(false), 5000)
    return () => window.clearTimeout(timer)
  }, [showSuccess])

  if (!branch) {
    return null
  }

  const statistics = [
    {
      label: "Assigned Users",
      value: branch.statistics.totalUsers,
      icon: HiOutlineUsers,
      tone: "text-[#0b6b51] bg-[#f2fbf7]",
    },
    {
      label: "Sales MTD",
      value: branch.statistics.totalSales,
      icon: HiOutlineCurrencyDollar,
      tone: "text-[#0b6b51] bg-[#f2fbf7]",
    },
    {
      label: "Transactions MTD",
      value: branch.statistics.totalTransactions,
      icon: HiOutlineReceiptPercent,
      tone: "text-[#0b6b51] bg-[#f2fbf7]",
    },
    {
      label: "Low Stock",
      value: branch.statistics.lowStockItems,
      icon: HiOutlineBellAlert,
      tone: Number(branch.statistics.lowStockItems) > 0 ? "text-amber-600 bg-amber-50" : "text-[#0b6b51] bg-[#f2fbf7]",
    },
  ]

  const handleDeactivate = (reason) => {
    onDeactivate(branch.id, reason)
    setIsDeactivateModalOpen(false)
    setShowSuccess(true)
  }

  return (
    <div className="relative mx-auto w-full max-w-[1500px] space-y-4 p-4 sm:p-5">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="hidden h-16 w-16 shrink-0 place-items-center rounded-full bg-[#f2fbf7] text-[#0b6b51] sm:grid">
                <HiOutlineBuildingStorefront className="h-8 w-8" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h2 className="text-xl font-bold text-slate-900">
                    {branch.shortName ?? branch.name}
                  </h2>
                  {branch.type === "Main Branch" ? <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#0b6b51] sm:hidden">MAIN</span> : null}
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                      branch.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {branch.status}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm sm:font-medium">
                  <span className="hidden sm:inline">{branch.type} <span className="px-1 text-slate-300">•</span> </span>{branch.code}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3">
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#00675b] px-2 text-xs font-bold text-white transition hover:bg-[#005348] sm:gap-2 sm:px-4 sm:text-sm"
              >
                <HiOutlinePencilSquare className="h-5 w-5" />
                Edit Branch
              </button>
              <button
                type="button"
                onClick={() => setIsDeactivateModalOpen(true)}
                disabled={branch.status === "Inactive"}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 sm:gap-2 sm:px-4 sm:text-sm"
              >
                <HiOutlineNoSymbol className="h-5 w-5" />
                {branch.status === "Inactive"
                  ? "Branch Inactive"
                  : "Deactivate Branch"}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <h2 className="text-base font-bold text-slate-900"><span className="sm:hidden">Branch Information</span><span className="hidden sm:inline">Branch Details</span></h2>
        <div className="mt-3 space-y-3.5 sm:hidden">
          <DetailItem label="Address" value={branch.address} />
          <DetailItem label="Operating Hours" value={branch.operatingHours} />
          <div>
            <p className="text-xs font-semibold text-slate-500">Branch Administrator</p>
            <AdministratorDetails branch={branch} onAssign={() => setIsAssignModalOpen(true)} />
          </div>
          <DetailItem label="Date Added" value={branch.dateAdded} />
        </div>
        <div className="mt-4 hidden gap-6 sm:grid md:grid-cols-2 md:divide-x md:divide-slate-100">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Branch Information</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Address" value={branch.address} />
              <DetailItem label="Operating Hours" value={branch.operatingHours} />
              <DetailItem label="Date Added" value={branch.dateAdded} />
            </div>
          </section>
          <section className="md:pl-6">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Branch Administrator</h3>
            <div className="mt-4"><AdministratorDetails branch={branch} onAssign={() => setIsAssignModalOpen(true)} /></div>
          </section>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <h2 className="text-base font-bold text-slate-900">Branch Overview</h2>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:mt-4 sm:gap-3 lg:grid-cols-4">
              {statistics.map((statistic) => {
                const Icon = statistic.icon

                return (
                  <div
                    key={statistic.label}
                    className="flex min-h-[82px] min-w-0 items-center gap-2 rounded-xl border border-slate-200 p-2.5 sm:min-h-0 sm:gap-3 sm:p-3"
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg sm:h-9 sm:w-9 ${statistic.tone}`}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <div><p className="text-xs font-semibold text-slate-500">{statistic.label}</p><p className="mt-1 break-words text-lg font-bold text-slate-900">{statistic.value}</p></div>
                  </div>
                )
              })}
        </div>
      </Card>

      {showSuccess ? (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex w-[min(420px,calc(100vw-2rem))] items-start gap-3 rounded-xl border border-emerald-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
        >
          <HiCheckCircle className="mt-0.5 h-7 w-7 shrink-0 text-emerald-600" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-emerald-700">
              Branch Deactivated Successfully
            </p>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              The branch has been moved to Backup &amp; Restore and can be
              restored later.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            className="text-xl leading-none text-slate-400 hover:text-slate-700"
            aria-label="Dismiss notification"
          >
            &times;
          </button>
        </div>
      ) : null}

      {isDeactivateModalOpen ? (
        <DeactivateBranchModal
          branch={branch}
          onCancel={() => setIsDeactivateModalOpen(false)}
          onConfirm={handleDeactivate}
        />
      ) : null}
      {isAssignModalOpen ? (
        <AssignAdministratorModal
          administrators={administrators}
          branch={branch}
          onCancel={() => setIsAssignModalOpen(false)}
          onAssign={(administrator) => {
            onAssignAdministrator(branch.id, administrator)
            setIsAssignModalOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}

function AdministratorDetails({ branch, onAssign }) {
  if (branch.admin) return <><p className="text-sm font-bold text-slate-900">{branch.admin}</p><p className="mt-1 text-sm font-medium text-slate-600">{branch.email}</p><p className="mt-1 text-sm font-medium text-slate-600">{branch.contact}</p></>
  return <div><p className="text-sm font-bold text-slate-900">No administrator assigned</p><p className="mt-1 text-sm leading-5 text-slate-500">This branch currently does not have a Branch Administrator.</p><button type="button" onClick={onAssign} className="mt-3 h-9 rounded-lg border border-[#0b6b51] px-3.5 text-xs font-bold text-[#0b6b51] transition hover:bg-emerald-50">Assign Administrator</button></div>
}

function AssignAdministratorModal({ administrators, branch, onAssign, onCancel }) {
  const [administratorId, setAdministratorId] = useState("")
  const selectedAdministrator = administrators.find((user) => user.id === administratorId)
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4"><button type="button" className="absolute inset-0" onClick={onCancel} aria-label="Close dialog" /><form onSubmit={(event) => { event.preventDefault(); if (selectedAdministrator) onAssign(selectedAdministrator) }} className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl"><header className="flex items-start justify-between border-b border-slate-100 p-5"><div><h2 className="text-lg font-bold text-slate-900">Assign Branch Administrator</h2><p className="mt-1 text-sm text-slate-500">{branch.shortName ?? branch.name} — {branch.code}</p></div><button type="button" onClick={onCancel} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close"><HiXMark className="h-5 w-5" /></button></header><div className="p-5"><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-600">Administrator <span className="text-red-500">*</span></span><select value={administratorId} onChange={(event) => setAdministratorId(event.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium outline-none focus:border-[#0b6b51] focus:ring-2 focus:ring-[#0b6b51]/15"><option value="">Select branch administrator</option>{administrators.map((user) => <option key={user.id} value={user.id}>{user.name} — {user.email}</option>)}</select></label>{!administrators.length ? <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs font-medium text-amber-800">No eligible active Branch Admin users are currently available.</p> : null}</div><footer className="flex justify-end gap-3 border-t border-slate-100 p-4"><button type="button" onClick={onCancel} className="h-10 rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-700">Cancel</button><button type="submit" disabled={!selectedAdministrator} className="h-10 rounded-lg bg-[#00675b] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">Assign Administrator</button></footer></form></div>
}

function DetailItem({ label, value }) {
  return <div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1.5 text-sm font-semibold text-slate-900">{value}</p></div>
}

export default BranchDetails
