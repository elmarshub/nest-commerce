interface Store {
  name: string;
  address: string;
  phone: string;
}

const stores: Store[] = [
  {
    name: "Haven Festac Flagship",
    address: "22 Festac Link Road, Festac Town, Lagos",
    phone: "+234 803 123 4567",
  },
  {
    name: "Haven Victoria Island",
    address: "15 Adeola Odeku Street, Victoria Island, Lagos",
    phone: "+234 803 234 5678",
  },
  {
    name: "Haven Lekki",
    address: "5 Admiralty Way, Lekki Phase 1, Lagos",
    phone: "+234 803 345 6789",
  },
];

export function StoreMap() {
  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-border bg-muted/10 relative">
      <iframe
        src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=Festac%20Town,%20Lagos&t=&z=14&ie=UTF8&iwloc=B&output=embed"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full opacity-90 hover:opacity-100 transition-opacity duration-500"
      />

      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 max-w-xs shadow-lg border border-border/40">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Our Locations
        </h4>
        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
          {stores.map((store) => (
            <div
              key={store.name}
              className="text-xs pb-3 border-b border-border/50 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-foreground">{store.name}</span>
              </div>
              <p className="text-muted-foreground mb-1 leading-relaxed">{store.address}</p>
              <p className="text-primary font-medium text-[10px]">{store.phone}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
