"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { PROMO_CODE } from "@/data/site";

export function Promo() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="promo" className="mx-auto grid max-w-6xl scroll-mt-20 gap-4 px-5 pb-24 md:grid-cols-3">
      <Reveal className="md:col-span-2">
        <div className="card h-full border-none bg-lime p-8 text-bg">
          <p className="text-sm font-bold">Promo minggu ini</p>
          <h3 className="mt-3 text-4xl font-extrabold md:text-5xl">Cashback 10% token PLN</h3>
          <p className="mt-3">Pakai kode di kasir, maks. cashback Rp10.000.</p>
          <button
            type="button"
            onClick={copy}
            className="mt-6 rounded-full bg-bg px-6 py-3 font-bold text-white transition hover:brightness-110"
          >
            {copied ? `${PROMO_CODE} · Tersalin ✓` : `${PROMO_CODE} · Salin`}
          </button>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="card flex h-full flex-col justify-between p-8">
          <h3 className="text-2xl font-bold">Transaksi ke-5 gratis admin</h3>
          <p className="mt-3 text-mut">Berlaku untuk semua produk, tiap bulan.</p>
        </div>
      </Reveal>
    </section>
  );
}
