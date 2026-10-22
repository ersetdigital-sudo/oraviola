"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { SERVICES, SERVICE_FILTERS } from "@/data/services";
import type { ServiceCategory } from "@/types";

type FilterKey = "all" | ServiceCategory;

export function ServiceGrid() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: SERVICES.length };
    for (const service of SERVICES) {
      map[service.category] = (map[service.category] ?? 0) + 1;
    }
    return map;
  }, []);

  const visible = filter === "all" ? SERVICES : SERVICES.filter((s) => s.category === filter);

  return (
    <section id="layanan" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
      <Reveal>
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2 className="max-w-lg text-4xl font-bold md:text-5xl">
            Satu dompet untuk semua kebutuhan digital.
          </h2>
          <p className="max-w-sm text-mut">
            Tiga kelompok layanan, ratusan produk, semua dengan harga yang sama transparannya.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div
          className="no-scrollbar mb-20 flex gap-2 overflow-x-auto pb-1.5"
          role="tablist"
          aria-label="Filter kategori layanan"
        >
          {SERVICE_FILTERS.map((item) => {
            const active = filter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(item.key)}
                className={`flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition ${
                  active
                    ? "border-lime bg-lime text-bg"
                    : "border-lime/20 text-txt hover:border-lime/50"
                }`}
              >
                {item.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    active ? "bg-bg/15" : "bg-white/8"
                  }`}
                >
                  {counts[item.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      <motion.div layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((service) => (
            <motion.div
              key={service.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Link
                href={service.href}
                className="card group flex items-center gap-4 p-4 pr-5 transition hover:-translate-y-0.5 hover:border-lime"
              >
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border"
                  style={{
                    background: `${service.accent}1f`,
                    color: service.accent,
                    borderColor: `${service.accent}40`,
                  }}
                >
                  <Icon name={service.icon} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-lg font-bold">{service.name}</span>
                    {service.badge ? (
                      <span className="rounded-md bg-lime px-1.5 py-0.5 text-[10px] font-extrabold tracking-[0.06em] text-bg">
                        {service.badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-sm text-mut">{service.description}</span>
                </span>

                <span
                  className="text-xl text-mut transition group-hover:text-lime"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
