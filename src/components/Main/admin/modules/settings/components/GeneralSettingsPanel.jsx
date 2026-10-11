import {
  HiOutlineBuildingOffice2,
  HiOutlineBuildingStorefront,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlinePencilSquare,
  HiOutlinePhone,
} from "react-icons/hi2"

import SettingsField from "./SettingsField"

function GeneralSettingsPanel({
  displayedSettings,
  isEditing,
  onCancel,
  onEdit,
  onSave,
  onUpdateDraftField,
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-[#0b6b51] sm:h-14 sm:w-14">
          <HiOutlineBuildingStorefront className="h-6 w-6 sm:h-8 sm:w-8" />
        </span>
        <h2 className="text-xl font-extrabold text-slate-950 sm:text-2xl">
          Pharmacy Information
        </h2>
      </div>

      <div className="mt-5 border-t border-slate-200 pt-5 sm:mt-6 sm:pt-8">
        <div className="grid gap-5 lg:grid-cols-2 xl:gap-7">
          <SettingsField
            icon={HiOutlineBuildingStorefront}
            label="Pharmacy Name"
            value={displayedSettings.pharmacyName}
            isEditing={false}
          />
          <SettingsField
            icon={HiOutlinePhone}
            label="Pharmacy Phone Number"
            value={displayedSettings.phone}
            isEditing={isEditing}
            onChange={(value) => onUpdateDraftField("phone", value)}
          />
          <SettingsField
            icon={HiOutlineBuildingOffice2}
            label="Branch"
            value={displayedSettings.branch}
            isEditing={false}
          />
          <SettingsField
            icon={HiOutlineEnvelope}
            label="Email"
            value={displayedSettings.email}
            isEditing={isEditing}
            onChange={(value) => onUpdateDraftField("email", value)}
          />
          <SettingsField
            icon={HiOutlineMapPin}
            label="Address"
            value={displayedSettings.address}
            isEditing={isEditing}
            onChange={(value) => onUpdateDraftField("address", value)}
          />
        </div>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-5 sm:pt-8 xl:mt-auto">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="h-12 rounded-xl border border-slate-200 bg-white px-7 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 sm:h-14 sm:text-base"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={isEditing ? onSave : onEdit}
            className="inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-[#00675b] px-9 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#005348] sm:h-14 sm:text-base"
          >
            <HiOutlinePencilSquare className="h-6 w-6" />
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GeneralSettingsPanel
