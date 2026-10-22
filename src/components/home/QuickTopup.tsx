"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { QUICK_TABS } from "@/data/products";
import { rp } from "@/lib/format";

type TabKey = (typeof QUICK_TABS)[number]["key"];

export function QuickTopup() {
  const [tab, setTab] = useState<TabKey>("pulsa");
  const [number, setNumber] = useState("");
  const [nominal, setNominal] = useState<number | null>(null);

  const active = useMemo(
    () => QUICK_TABS.find((t) => t.key === tab) ?? QUICK_TABS[0],
    [tab],
  );

  const total = useMemo(() => {
    if (nominal === null) return 0;
    return active.unit === "diamond" ? nominal * 300 : nominal * 1000 + 1500;
  }, [active.unit, nominal]);

  const changeTab = (key: TabKey) => {
    setTab(key);
    setNominal(null);
  };

  const href = (() => {
    const params = new URLSearchParams();
    if (number.trim()) params.set("no", number.trim());
    if (nominal !== null) params.set("nominal", String(nominal));
    const query = params.toString();
    return `/${active.key}${query ? `?${query}` : ""}`;
  })();

  return (
    <div className="card min-w-0 p-6 md:p-8">
      <div
        className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-white/5 p-1 text-xs font-bold sm:text-sm"
        role="tablist"
        aria-label="Pilih jenis isi ulang"
      >
        {QUICK_TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => changeTab(item.key)}
            className={`shrink-0 flex-1 rounded-full px-2 py-2 whitespace-nowrap transition ${
              tab === item.key ? "bg-lime text-bg" : "text-mut hover:text-txt"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Link
        href={`/${active.key}`}
        className="mt-4 block text-sm font-bold text-lime transition hover:underline"
      >
        Lihat detail &amp; semua produk →
      </Link>

      <label htmlFor="quick-number" className="mt-4 block text-sm text-mut">
        {active.field}
      </label>
      <input
        id="quick-number"
        value={number}
        onChange={(event) => setNumber(event.target.value)}
        placeholder={active.placeholder}
        inputMode="numeric"
        autoComplete="off"
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-lime"
      />

      <p className="mt-6 text-sm text-mut">Pilih nominal</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mt-2 grid grid-cols-3 gap-2"
        >
          {active.nominals.map((value) => {
            const active_ = nominal === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setNominal(value)}
                aria-pressed={active_}
                className={`rounded-xl border py-3 text-sm font-bold transition ${
                  active_
                    ? "border-lime bg-lime/10"
                    : "border-white/10 hover:border-lime/50"
                }`}
              >
                {active.unit === "diamond" ? `${value} 💎` : `${value}rb`}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
        <div>
          <p className="text-sm text-mut">Total bayar</p>
          <p className="hd text-2xl font-bold">{rp(total)}</p>
        </div>
        <Link
          href={href}
          className="rounded-full bg-lime px-7 py-3 font-bold text-bg transition hover:brightness-95"
        >
          Bayar
        </Link>
      </div>
    </div>
  );
}
