import { useEffect, useMemo, useState } from "react"
import {
  HiOutlineArchiveBox,
  HiOutlineBuildingStorefront,
  HiOutlineCog6Tooth,
  HiOutlineDocumentText,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlinePencilSquare,
  HiOutlinePhone,
} from "react-icons/hi2"

import SuperAdminBackupRestore from "../backup_restore/SuperAdminBackupRestore"

const settingsTabs = [
  {
    id: "general",
    label: "General",
    description: "System information",
    icon: HiOutlineCog6Tooth,
  },
  {
    id: "audit-logs",
    label: "Audit Logs",
    description: "System activity",
    icon: HiOutlineDocumentText,
  },
  {
    id: "archives",
    label: "Archives",
    description: "Archived records",
    icon: HiOutlineArchiveBox,
  },
]

const auditLogs = [
  {
    action: "Branch information updated",
    module: "Branches",
    user: "Super Admin",
    date: "June 15, 2026 | 9:20 AM",
  },
  {
    action: "Super Admin profile updated",
    module: "Account",
    user: "Super Admin",
    date: "June 15, 2026 | 9:05 AM",
  },
  {
    action: "System login successful",
    module: "Authentication",
    user: "Super Admin",
    date: "June 15, 2026 | 8:40 AM",
  },
]

function SuperAdminSettings({
  activeTab,
  archivedBranches,
  archivedMasterRecords = [],
  archivedInventoryItems = [],
  archivedBundles = [],
  archivedUsers,
  onRestoreRecord,
  onTabChange,
}) {
  return (
    <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-4 p-4 sm:gap-4 sm:p-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-3 sm:p-4 lg:sticky lg:top-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <h2 className="px-2 text-lg font-bold text-slate-900">Settings</h2>
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] lg:grid lg:grid-cols-1 lg:gap-2 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.id === activeTab

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex min-w-[92px] flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-center transition lg:w-full lg:min-w-0 lg:justify-start lg:p-3 lg:text-left ${
                  isActive
                    ? "bg-emerald-50 text-[#0b6b51]"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`hidden h-9 w-9 shrink-0 place-items-center rounded-lg lg:grid ${
                    isActive
                      ? "bg-emerald-100 text-[#0b6b51]"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold lg:text-base">{tab.label}</span>
                  <span className="mt-0.5 hidden text-xs font-medium text-slate-500 lg:block">
                    {tab.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </aside>

      <div className="min-w-0">
        {activeTab === "general" ? <GeneralSettings /> : null}
        {activeTab === "audit-logs" ? <AuditLogs /> : null}
        {activeTab === "archives" ? (
          <SuperAdminBackupRestore
            archivedBranches={archivedBranches}
            archivedMasterRecords={archivedMasterRecords}
            archivedInventoryItems={archivedInventoryItems}
            archivedBundles={archivedBundles}
            archivedUsers={archivedUsers}
            onRestoreRecord={onRestoreRecord}
          />
        ) : null}
      </div>
    </div>
  )
}

function GeneralSettings() {
  const initialSettings = {
    pharmacyName: "Lyfe Pharmacy",
    phone: "0993 257 83787",
    mainBranch: "Camalig, Albay",
    email: "lyfepharma@gmail.com",
    address: "Camalig Zone 5",
  }
  const [settings, setSettings] = useState(initialSettings)
  const [draft, setDraft] = useState(initialSettings)
  const [isEditing, setIsEditing] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    if (!showSaved) return undefined
    const timer = window.setTimeout(() => setShowSaved(false), 5000)
    return () => window.clearTimeout(timer)
  }, [showSaved])

  const fields = [
    {
      name: "pharmacyName",
      label: "Pharmacy Name",
      icon: HiOutlineBuildingStorefront,
    },
    {
      name: "phone",
      label: "Pharmacy Phone Number",
      icon: HiOutlinePhone,
    },
    {
      name: "mainBranch",
      label: "Main Branch",
      icon: HiOutlineBuildingStorefront,
    },
    {
      name: "email",
      label: "Email",
      icon: HiOutlineEnvelope,
    },
    {
      name: "address",
      label: "Address",
      icon: HiOutlineMapPin,
      wide: true,
    },
  ]

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-5">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5 sm:gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-[#0b6b51]">
          <HiOutlineBuildingStorefront className="h-7 w-7" />
        </span>
        <h2 className="text-xl font-bold text-slate-900 sm:text-xl">
          Pharmacy Information
        </h2>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((field) => {
          const Icon = field.icon
          return (
            <div
              key={field.label}
              className={field.wide ? "md:col-span-2" : ""}
            >
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                {field.label}
              </p>
              {isEditing ? (
                <div className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 font-semibold text-slate-800 focus-within:border-[#0b6b51]">
                  <Icon className="h-5 w-5 shrink-0 text-[#0b6b51]" />
                  <input
                    type={field.name === "email" ? "email" : "text"}
                    value={draft[field.name]}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                    className="min-w-0 flex-1 bg-transparent outline-none"
                  />
                </div>
              ) : (
                <p className="break-words text-sm font-bold text-slate-900">{settings[field.name]}</p>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex justify-stretch border-t border-slate-200 pt-5 sm:justify-end">
        {isEditing ? (
          <div className="grid w-full grid-cols-1 gap-3 sm:flex sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setDraft(settings)
                setIsEditing(false)
              }}
              className="h-11 rounded-lg border border-slate-200 px-6 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setSettings(draft)
                setIsEditing(false)
                setShowSaved(true)
              }}
              className="h-11 rounded-lg bg-[#00675b] px-6 text-sm font-bold text-white hover:bg-[#005348]"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(settings)
              setShowSaved(false)
              setIsEditing(true)
            }}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#00675b] px-6 text-sm font-bold text-white transition hover:bg-[#005348] sm:w-auto"
          >
            <HiOutlinePencilSquare className="h-5 w-5" />
            Edit
          </button>
        )}
      </div>

      {showSaved ? (
        <p className="mt-4 text-right text-sm font-bold text-emerald-700">
          Pharmacy information saved successfully.
        </p>
      ) : null}
    </section>
  )
}

function AuditLogs() {
  const [query, setQuery] = useState("")
  const [moduleFilter, setModuleFilter] = useState("All Modules")
  const [dateFilter, setDateFilter] = useState("")
  const modules = ["All Modules", ...new Set(auditLogs.map((log) => log.module))]
  const visibleLogs = useMemo(() => auditLogs.filter((log) => {
    const matchesSearch = !query.trim() || [log.action, log.module, log.user].some((value) => value.toLowerCase().includes(query.trim().toLowerCase()))
    const matchesModule = moduleFilter === "All Modules" || log.module === moduleFilter
    const matchesDate = !dateFilter || new Date(log.date.split("|")[0].trim()).toLocaleDateString("en-CA") === dateFilter
    return matchesSearch && matchesModule && matchesDate
  }), [dateFilter, moduleFilter, query])

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-4 border-b border-slate-200 p-5">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-[#0b6b51]">
          <HiOutlineDocumentText className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Audit Logs</h2>
          <p className="mt-1 text-sm text-slate-500">
            Review recent Super Admin system activity.
          </p>
        </div>
      </div>

      <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[minmax(240px,1fr)_180px_170px]">
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search activity..." className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-[#0b6b51]" />
        <select value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#0b6b51]">{modules.map((module) => <option key={module}>{module}</option>)}</select>
        <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} aria-label="Filter by date" className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-[#0b6b51]" />
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="px-5 py-4">Action</th>
              <th className="px-5 py-4">Module</th>
              <th className="px-5 py-4">Performed By</th>
              <th className="px-5 py-4">Date &amp; Time</th>
            </tr>
          </thead>
          <tbody>
            {visibleLogs.map((log) => (
              <tr key={`${log.action}-${log.date}`} className="border-t border-slate-100">
                <td className="px-5 py-4 font-semibold text-slate-900">
                  {log.action}
                </td>
                <td className="px-5 py-4 text-slate-600">{log.module}</td>
                <td className="px-5 py-4 text-slate-600">{log.user}</td>
                <td className="px-5 py-4 text-slate-600">{log.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-slate-100 md:hidden">{visibleLogs.map((log) => <article key={`${log.action}-${log.date}`} className="p-4"><p className="font-bold text-slate-900">{log.action}</p><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500"><span className="font-semibold text-[#0b6b51]">{log.module}</span><span>{log.date}</span><span>by {log.user}</span></div></article>)}</div>
      {!visibleLogs.length ? <p className="px-5 py-10 text-center text-sm font-semibold text-slate-500">No audit activity found.</p> : null}
    </section>
  )
}

export default SuperAdminSettings



