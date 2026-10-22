"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { clearOrders, findOrder, getOrders } from "@/lib/orders";
import { formatDateTime, rp } from "@/lib/format";
import type { Order } from "@/types";

const STATUS: Record<string, { label: string; color: string }> = {
  sukses: { label: "Berhasil", color: "#D6FF63" },
  diproses: { label: "Sedang diproses", color: "#5BE3B0" },
  menunggu: { label: "Menunggu pembayaran", color: "#FFD25C" },
};

export function TransactionChecker() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [history, setHistory] = useState<Order[]>([]);

  const refreshHistory = useCallback(() => {
    setHistory(getOrders());
  }, []);

  const show = useCallback(
    (rawId: string) => {
      const id = (rawId ?? "").trim().toUpperCase();
      if (!id) {
        setOrder(null);
        setNotFound(false);
        return;
      }
      const found = findOrder(id);
      setOrder(found ?? null);
      setNotFound(!found);
    },
    [],
  );

  useEffect(() => {
    refreshHistory();
    const id = searchParams.get("id");
    if (id) {
      setQuery(id);
      show(id);
    }
  }, [refreshHistory, searchParams, show]);

  const status = order ? (STATUS[order.status] ?? STATUS.menunggu) : null;
  const ok = order?.status === "sukses";
  const paid = Boolean(order?.paid);

  const steps: { label: string; at?: number; done: boolean }[] = order
    ? [
        { label: "Pesanan dibuat", at: order.t, done: true },
        { label: "Pembayaran diterima", at: order.paid, done: paid },
        {
          label: "Produk dikirim ke tujuan",
          at: order.paid ? order.paid + 3000 : undefined,
          done: ok,
        },
      ]
    : [];

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <p className="text-xs tracking-[0.2em] text-mint uppercase">Lacak pesanan</p>
      <h1 className="hd mt-2 text-4xl font-extrabold md:text-5xl">Cek Transaksi</h1>
      <p className="mt-3 text-mut">
        Masukkan nomor pesanan (contoh: ORV1234567) untuk melihat status pembayaran dan pengiriman
        produk.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          show(query);
        }}
        className="card mt-8 flex flex-col gap-3 p-5 sm:flex-row"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
          aria-label="Nomor pesanan"
          placeholder="ORV1234567"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg tracking-wide uppercase outline-none transition focus:border-lime"
        />
        <button
          type="submit"
          className="cursor-pointer rounded-full bg-lime px-7 py-3 font-bold text-bg transition hover:brightness-95"
        >
          Cek status
        </button>
      </form>

      <div className="mt-6">
        {notFound && query.trim() ? (
          <div className="card p-6">
            <p className="hd text-xl font-bold">Pesanan tidak ditemukan</p>
            <p className="mt-2 text-sm text-mut">
              Cek lagi nomor <b className="text-txt">{query.trim().toUpperCase()}</b>. Riwayat hanya
              tersimpan di perangkat &amp; browser yang dipakai saat memesan.
            </p>
          </div>
        ) : null}

        {order && status ? (
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-mut">No. pesanan</p>
                <p className="hd text-2xl font-bold">{order.id}</p>
              </div>
              <span
                className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap"
                style={{
                  background: `${status.color}22`,
                  color: status.color,
                  border: `1px solid ${status.color}55`,
                }}
              >
                {status.label}
              </span>
            </div>

            <div className="mt-5">
              <DetailRow label="Layanan" value={order.svc} />
              <DetailRow label="Produk" value={order.prod} />
              <DetailRow label="Tujuan" value={order.no} />
              <DetailRow label="Metode" value={order.met} />
              <DetailRow label="Tanggal" value={formatDateTime(order.t)} />
              <div className="flex justify-between pt-3">
                <span className="text-sm text-mut">Total</span>
                <b className="hd text-2xl text-lime">{rp(order.total)}</b>
              </div>
            </div>

            <ol className="mt-6 space-y-4">
              {steps.map((step, index) => (
                <li key={step.label} className="flex gap-3">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      step.done ? "bg-lime text-bg" : "border-2 border-white/20 text-mut"
                    }`}
                  >
                    {step.done ? "✓" : index + 1}
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${step.done ? "" : "text-mut"}`}>{step.label}</p>
                    {step.done && step.at ? (
                      <p className="text-xs text-mut">{formatDateTime(step.at)}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>

            {order.status === "menunggu" ? (
              <p className="mt-5 text-sm text-amber">
                Pembayaran belum kami terima. Selesaikan pembayaran sebelum batas waktu.
              </p>
            ) : order.status === "diproses" ? (
              <p className="mt-5 text-sm text-mint">
                Pembayaranmu sudah kami terima. Pesanan sedang diproses dan otomatis
                masuk ke akun dalam hitungan detik.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <section className="mt-12">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="hd text-xl font-bold">Riwayat di perangkat ini</h2>
          <button
            type="button"
            onClick={() => {
              clearOrders();
              refreshHistory();
              setOrder(null);
              setNotFound(false);
            }}
            className="cursor-pointer text-xs text-mut transition hover:text-white"
          >
            Hapus riwayat
          </button>
        </div>

        {history.length === 0 ? (
          <div className="card p-6 text-sm text-mut">
            Belum ada transaksi di perangkat ini.{" "}
            <Link href="/#layanan" className="font-bold text-lime">
              Mulai isi ulang →
            </Link>
          </div>
        ) : (
          <div className="card divide-y divide-white/5 overflow-hidden">
            {history.map((item) => {
              const itemStatus = STATUS[item.status] ?? STATUS.menunggu;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setQuery(item.id);
                    show(item.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/5"
                >
                  <span className="min-w-0">
                    <b className="block truncate">{item.prod}</b>
                    <span className="text-xs text-mut">
                      {item.id} · {formatDateTime(item.t)}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <b className="block text-sm text-lime">{rp(item.total)}</b>
                    <span className="text-xs" style={{ color: itemStatus.color }}>
                      {itemStatus.label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 py-2 text-sm">
      <span className="text-mut">{label}</span>
      <b className="text-right">{value}</b>
    </div>
  );
}
