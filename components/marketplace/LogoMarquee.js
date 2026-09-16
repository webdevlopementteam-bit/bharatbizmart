import Image from "next/image";

/**
 * Continuous scrolling strip of every approved vendor's logo. Pure CSS
 * animation (no client JS needed) — the list is duplicated once so the loop
 * is seamless, and the animation duration scales with how many logos there
 * are so the scroll speed stays calm regardless of vendor count.
 */
export default function LogoMarquee({ vendors }) {
  if (!vendors?.length) return null;
  const looped = [...vendors, ...vendors];
  const durationSeconds = Math.max(24, vendors.length * 3);

  return (
    <div className="border-y border-slate-100 bg-white py-10">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
        Trusted by {vendors.length}+ businesses across India
      </p>
      <div className="group relative overflow-hidden">
        <div
          className="flex w-max items-center gap-16 group-hover:[animation-play-state:paused]"
          style={{ animation: `marquee ${durationSeconds}s linear infinite` }}
        >
          {looped.map((v, i) => (
            <div key={`${v._id}-${i}`} className="flex h-28 w-72 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm">
              {v.logo ? (
                <div className="relative h-20 w-64">
                  <Image src={v.logo} alt={v.businessName} fill className="object-contain" sizes="256px" />
                </div>
              ) : (
                <span className="truncate px-4 text-base font-semibold text-slate-500">{v.businessName}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
