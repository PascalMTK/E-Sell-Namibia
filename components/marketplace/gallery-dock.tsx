import Link from "next/link";
import "./gallery-dock.css";
import { formatNad } from "@/lib/utils/currency";

export interface DockItem {
  id: string;
  slug: string;
  name: string;
  price: string;
  image: string;
}

export function GalleryDock({ items }: { items: DockItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="esn-dock-wrap">
      <nav
        className="esn-dock"
        aria-label="Featured products showcase"
        style={{ "--max-p": items.length } as React.CSSProperties}
      >
        {items.map((item, i) => (
          <Link
            key={item.id}
            href={`/products/${item.slug}`}
            className="esn-dock-item"
            aria-label={`${item.name} — ${formatNad(item.price)}`}
            style={{ "--i": i, "--img": `url('${item.image}')` } as React.CSSProperties}
          >
            <span className="esn-dock-caption">
              <strong>{item.name}</strong>
              <span>{formatNad(item.price)}</span>
            </span>
            <span className="esn-dock-image" aria-hidden="true" />
            <span className="esn-dock-zone" aria-hidden="true">
              {Array.from({ length: 9 }).map((_, j) => (
                <i key={j} className="esn-dock-strip" />
              ))}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
