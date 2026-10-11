import DashboardPanel from "./DashboardPanel"

const defaultChartWidth = 760
const defaultChartHeight = 250
const defaultChartPadding = {
  top: 20,
  right: 42,
  bottom: 50,
  left: 75,
}

const formatCurrencyTick = (value) => value.toLocaleString()

const buildSmoothPath = (points) => {
  if (!points.length) {
    return ""
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`
  }

  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  }

  let path = `M ${points[0].x} ${points[0].y}`

  for (let index = 0; index < points.length - 1; index += 1) {
    const previousPoint = points[index - 1] ?? points[index]
    const currentPoint = points[index]
    const nextPoint = points[index + 1]
    const followingPoint = points[index + 2] ?? nextPoint

    const controlPointOneX =
      currentPoint.x + (nextPoint.x - previousPoint.x) / 6
    const controlPointOneY =
      currentPoint.y + (nextPoint.y - previousPoint.y) / 6
    const controlPointTwoX =
      nextPoint.x - (followingPoint.x - currentPoint.x) / 6
    const controlPointTwoY =
      nextPoint.y - (followingPoint.y - currentPoint.y) / 6

    path += ` C ${controlPointOneX} ${controlPointOneY} ${controlPointTwoX} ${controlPointTwoY} ${nextPoint.x} ${nextPoint.y}`
  }

  return path
}

function BranchStatisticsCard({
  points,
  title = "Branch Statistics",
  actionLabel,
  action,
  metricLabel = "Camalig",
  lineColor = "#4b7bec",
  className = "",
  chartClassName = "h-auto w-full",
  chartWidth = defaultChartWidth,
  chartHeight = defaultChartHeight,
  chartPadding = defaultChartPadding,
}) {
  const safePoints = points.filter((point) => typeof point.value === "number")

  if (!safePoints.length) {
    return (
      <DashboardPanel
        title={title}
        actionLabel={actionLabel}
        action={action}
        className={className}
      >
        <div className="grid min-h-70 place-items-center text-center text-slate-400">
          <div>
            <p className="text-lg font-medium text-slate-500">
              No chart data available.
            </p>
          </div>
        </div>
      </DashboardPanel>
    )
  }

  const maxValue = Math.max(...safePoints.map((point) => point.value), 10000)
  const roundedMax = Math.max(Math.ceil(maxValue / 10000) * 10000, 10000)
  const tickCount = 5
  const chartInnerWidth = chartWidth - chartPadding.left - chartPadding.right
  const chartInnerHeight = chartHeight - chartPadding.top - chartPadding.bottom
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) =>
    Math.round((roundedMax / tickCount) * index)
  )
  const chartBottom = chartHeight - chartPadding.bottom

  const chartPoints = safePoints.map((point, index) => {
    const x =
      safePoints.length === 1
        ? chartPadding.left + chartInnerWidth / 2
        :
      chartPadding.left +
      (chartInnerWidth / Math.max(safePoints.length - 1, 1)) * index
    const y =
      chartPadding.top +
      chartInnerHeight -
      (point.value / roundedMax) * chartInnerHeight

    return {
      x,
      y,
      label: point.label ?? point.month,
      value: point.value,
    }
  })

  const linePath = buildSmoothPath(chartPoints)

  return (
    <DashboardPanel
      title={title}
      actionLabel={actionLabel}
      action={action}
      className={className}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: lineColor }}
          />
          <span>{metricLabel}</span>
        </div>
        <div className="rounded-3xl bg-white">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className={chartClassName}
            role="img"
            aria-label={`${title} line chart`}
          >
            {ticks.map((tick) => {
              const y =
                chartPadding.top +
                chartInnerHeight -
                (tick / roundedMax) * chartInnerHeight

              return (
                <g key={tick}>
                  <line
                    x1={chartPadding.left}
                    y1={y}
                    x2={chartWidth - chartPadding.right}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <text
                    x={chartPadding.left - 14}
                    y={y + 5}
                    textAnchor="end"
                    fontSize="10"
                    fill="#334155"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatCurrencyTick(tick)}
                  </text>
                </g>
              )
            })}

            <line
              x1={chartPadding.left}
              y1={chartBottom}
              x2={chartWidth - chartPadding.right}
              y2={chartBottom}
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />

            <path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {chartPoints.map((point) => (
              <g key={point.label}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill={lineColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={point.x}
                  y={chartHeight - 14}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#334155"
                >
                  {point.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </DashboardPanel>
  )
}

export default BranchStatisticsCard
