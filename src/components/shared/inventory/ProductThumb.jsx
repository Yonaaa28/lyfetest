const imageToneClasses = {
  blue: "border-blue-100 bg-blue-50 text-blue-700",
  cyan: "border-cyan-100 bg-cyan-50 text-cyan-700",
  red: "border-rose-100 bg-rose-50 text-rose-700",
  green: "border-emerald-100 bg-emerald-50 text-emerald-700",
  pink: "border-pink-100 bg-pink-50 text-pink-700",
}

function ProductThumb({ item, large = false }) {
  const imageClassName = large
    ? "h-full w-full object-contain"
    : "h-full w-full object-contain"

  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl border ${
        imageToneClasses[item.imageTone] ?? imageToneClasses.blue
      } ${large ? "h-48 w-full sm:h-56 xl:h-40" : "h-12 w-16"}`}
    >
      {item.image ? (
        <img
          src={item.image}
          alt={item.productName}
          className={imageClassName}
        />
      ) : (
        <>
          <div
            className={`rounded-lg border-2 border-current bg-white shadow-sm ${
              large ? "h-14 w-24" : "h-7 w-11"
            }`}
          >
            <div className="mt-2 h-1.5 w-full bg-current opacity-20" />
            <div
              className={`mx-auto mt-2 rounded-full bg-current opacity-80 ${
                large ? "h-3 w-14" : "h-1.5 w-6"
              }`}
            />
          </div>
          <div
            className={`absolute rounded-full bg-current opacity-15 ${
              large
                ? "-bottom-6 right-8 h-12 w-24"
                : "-bottom-2 right-2 h-5 w-9"
            }`}
          />
        </>
      )}
    </div>
  )
}

export default ProductThumb
