import type { Metadata } from "next";
import { Suspense } from "react";
import { TransactionChecker } from "@/components/cek/TransactionChecker";

export const metadata: Metadata = {
  title: "Cek Transaksi",
  description:
    "Lacak status pembayaran dan pengiriman produk Oraviola memakai nomor pesanan. Riwayat tersimpan aman di perangkat kamu.",
  alternates: { canonical: "/cek" },
  openGraph: {
    title: "Cek Transaksi | Oraviola",
    description:
      "Lacak status pembayaran dan pengiriman produk Oraviola memakai nomor pesanan.",
    url: "/cek",
  },
};

export default function CekPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-2xl px-5 py-12">
          <p className="text-xs tracking-[0.2em] text-mint uppercase">Lacak pesanan</p>
          <h1 className="hd mt-2 text-4xl font-extrabold md:text-5xl">Cek Transaksi</h1>
          <p className="mt-3 text-mut">Memuat data…</p>
        </main>
      }
    >
      <TransactionChecker />
    </Suspense>
  );
}
