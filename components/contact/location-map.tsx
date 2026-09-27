export function LocationMap({ address }: { address: string }) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <div className="flex flex-col gap-3 bg-off-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-brand-black">Find us</h2>
          <p className="mt-1 text-sm text-secondary-text">{address}</p>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-brand-black underline underline-offset-4 hover:text-brand-yellow-hover"
        >
          Open in Google Maps
        </a>
      </div>
      <iframe
        src={src}
        title={`Map showing ${address}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-80 w-full sm:h-96"
      />
    </div>
  );
}
