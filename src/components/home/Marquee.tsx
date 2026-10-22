import { MARQUEE_ITEMS } from "@/data/site";

export function Marquee() {
  const row = MARQUEE_ITEMS.map((item) => (
    <span key={item} className="flex items-center gap-10">
      <span>{item}</span>
      <span aria-hidden="true" className="text-lime/40">
        ·
      </span>
    </span>
  ));

  return (
    <div className="overflow-hidden border-y border-white/5 py-5" aria-hidden="true">
      <div className="flex w-max animate-marquee text-sm tracking-widest whitespace-nowrap text-mut">
        <div className="flex gap-10 pr-10">{row}</div>
        <div className="flex gap-10 pr-10">{row}</div>
      </div>
    </div>
  );
}
