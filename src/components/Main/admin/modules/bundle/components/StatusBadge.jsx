function StatusBadge({ status }) {
  const isActive = status === "Active"

  return (
    <span
      className={`inline-flex rounded-lg px-3 py-1 text-xs font-bold ${
        isActive
          ? "bg-emerald-100 text-[#0b6b51]"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {status}
    </span>
  )
}

export default StatusBadge
