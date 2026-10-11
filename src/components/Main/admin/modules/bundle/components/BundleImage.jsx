function BundleImage({ bundle, large = false }) {
  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 ${
        large ? "h-48 w-full sm:h-56 xl:h-40" : "h-16 w-24"
      }`}
    >
      {bundle.image ? (
        <img
          src={bundle.image}
          alt={bundle.name}
          className="h-full max-h-full w-full max-w-full object-contain"
        />
      ) : (
        <div className="flex items-center justify-center">
          {bundle.includedItems.slice(0, 3).map((item, index) => (
            <img
              key={item.productId}
              src={item.product.image}
              alt={item.productName}
              className={`rounded-lg object-contain shadow-sm ${
                large ? "h-24 w-28" : "h-11 w-14"
              } ${index > 0 ? (large ? "-ml-8" : "-ml-5") : ""}`}
              style={{ zIndex: bundle.includedItems.length - index }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BundleImage
