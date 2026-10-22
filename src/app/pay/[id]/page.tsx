import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Pesanan Menunggu Pembayaran",
  description: "Selesaikan pembayaran pesanan Oraviola.",
  robots: { index: false, follow: false },
};

type PayPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ amount?: string; method?: string }>;
};

export default async function PayPage({ params, searchParams }: PayPageProps) {
  const { id } = await params;
  const { amount, method } = await searchParams;

  const total = Number(amount);
  const hasAmount = Number.isFinite(total) && total > 0;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime text-3xl font-extrabold text-bg">
        QR
      </span>

      <h1 className="mt-6 text-3xl font-extrabold md:text-4xl">Selesaikan pembayaran</h1>
      <p className="mt-3 text-mut">
        Pesanan <b className="text-txt">{id}</b> menunggu pembayaran kamu.
      </p>

      {hasAmount ? (
        <div className="card mt-8 w-full p-6 text-left">
          <div className="flex justify-between gap-4 border-b border-white/5 py-2 text-sm">
            <span className="text-mut">Total tagihan</span>
            <b className="text-lime">Rp {total.toLocaleString("id-ID")}</b>
          </div>
          <div className="flex justify-between gap-4 py-2 text-sm">
            <span className="text-mut">Metode</span>
            <b className="uppercase">{method ?? "-"}</b>
          </div>
        </div>
      ) : null}

      <p className="mt-6 text-sm text-mut">
        Buka aplikasi QRIS-mu, scan kode di halaman pemesanan, lalu selesaikan pembayaran.
      </p>

      <Link
        href="/cek"
        className="mt-8 rounded-full bg-lime px-7 py-3 font-bold text-bg transition hover:brightness-95"
      >
        Cek status transaksi
      </Link>

      <Link href="/" className="mt-4 text-sm text-mut transition hover:text-white">
        Kembali ke beranda
      </Link>

      <p className="mt-10 text-xs text-mut/70">{SITE.name}</p>
    </main>
  );
}
