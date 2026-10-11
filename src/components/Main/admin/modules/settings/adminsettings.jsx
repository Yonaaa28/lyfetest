import { useState } from "react"

import useNotification from "../../../../../hooks/useNotification"
import ArchivesSettingsPanel from "./components/ArchivesSettingsPanel"
import GeneralSettingsPanel from "./components/GeneralSettingsPanel"
import SettingsSidebar from "./components/SettingsSidebar"
import { defaultPharmacySettings, settingsTabs } from "./data/settingsData"

function AdminSettings({ branch }) {
  const { showSuccess } = useNotification()
  const [activeSettingsTab, setActiveSettingsTab] = useState("general")
  const [isEditing, setIsEditing] = useState(false)
  const [pharmacySettings, setPharmacySettings] = useState({
    ...defaultPharmacySettings,
    branch: branch?.location ?? defaultPharmacySettings.branch,
  })
  const [draftSettings, setDraftSettings] = useState(pharmacySettings)

  const updateDraftField = (field, value) => {
    setDraftSettings((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }))
  }

  const handleEdit = () => {
    setDraftSettings(pharmacySettings)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDraftSettings(pharmacySettings)
    setIsEditing(false)
  }

  const handleSave = () => {
    setPharmacySettings(draftSettings)
    setIsEditing(false)
    showSuccess("Pharmacy information updated.", {
      title: "Settings saved",
    })
  }

  const displayedSettings = isEditing ? draftSettings : pharmacySettings

  return (
    <div className="px-0 pb-4 pt-4 sm:px-4 lg:px-1">
      <section className="grid min-w-0 gap-5 xl:grid-cols-[240px_minmax(0,1fr)]">
        <SettingsSidebar
          activeSettingsTab={activeSettingsTab}
          tabs={settingsTabs}
          onTabChange={setActiveSettingsTab}
        />

        <div className="min-w-0 overflow-hidden rounded-3xl border border-white/70 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-6 xl:h-[calc(100vh-4rem)] xl:min-h-0 xl:p-8">
          {activeSettingsTab === "general" ? (
            <GeneralSettingsPanel
              displayedSettings={displayedSettings}
              isEditing={isEditing}
              onCancel={handleCancel}
              onEdit={handleEdit}
              onSave={handleSave}
              onUpdateDraftField={updateDraftField}
            />
          ) : (
            <ArchivesSettingsPanel branch={branch} />
          )}
        </div>
      </section>
    </div>
  )
}

export default AdminSettings
