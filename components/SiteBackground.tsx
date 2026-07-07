import Image from "next/image";

/**
 * A single, consistent background used behind every page: the church
 * building photo, softened with a brand-colored (ink/gold) overlay so it
 * never competes with foreground content. It automatically re-tints itself
 * for dark and light mode via the CSS variables defined in globals.css.
 */
export default function SiteBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <Image
        src="/images/building.jpg"
        alt=""
        fill
        priority
        className="object-cover opacity-[var(--bg-image-opacity)]"
      />
      <div className="absolute inset-0 bg-site-overlay" />
      <div className="absolute inset-0 bg-site-vignette" />
      <div className="absolute inset-0 bg-site-weave" />
    </div>
  );
}
