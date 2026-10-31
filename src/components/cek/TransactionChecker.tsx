"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatDateTime, rp } from "@/lib/format";

type PublicStatus = "menunggu" | "diproses" | "sukses" | "gagal";

type PublicOrder = {
  id: string;
  svc: string;
  prod: string;
  no: string;
  met: string;
  total: number;
  t: number;
  status: PublicStatus;
  sn: string | null;
  paidAt: number | null;
  completedAt: number | null;
};

const STATUS: Record<PublicStatus, { label: string; color: string }> = {
  sukses: { label: "Berhasil", color: "#D6FF63" },
  diproses: { label: "Sedang diproses", color: "#5BE3B0" },
  menunggu: { label: "Menunggu pembayaran", color: "#FFD25C" },
  gagal: { label: "Dibatalkan", color: "#FF8A8A" },
};

export function TransactionChecker() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const show = useCallback(async (rawId: string) => {
    const id = (rawId ?? "").trim().toUpperCase();
    setError("");
    if (!id) {
      setOrder(null);
      setNotFound(false);
      return;
    }
    if (!/^OVL-[A-Z0-9-]{4,}$/i.test(id)) {
      setOrder(null);
      setNotFound(false);
      setError("Format nomor pesanan belum tepat. Contoh: OVL-YYMMDD-XXXXXX.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
        headers: { accept: "application/json" },
      });
      if (!response.ok) {
        setOrder(null);
        setNotFound(true);
        return;
      }
      setOrder((await response.json()) as PublicOrder);
      setNotFound(false);
    } catch {
      setOrder(null);
      setNotFound(false);
      setError("Gagal memeriksa pesanan. Coba lagi sebentar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setQuery(id);
      void show(id);
    }
  }, [searchParams, show]);

  const status = order ? STATUS[order.status] : null;
  const ok = order?.status === "sukses";
  const paid = Boolean(order?.paidAt);

  const steps: { label: string; at?: number | null; done: boolean }[] = order
    ? [
        { label: "Pesanan dibuat", at: order.t, done: true },
        { label: "Pembayaran diterima", at: order.paidAt, done: paid },
        { label: "Produk dikirim ke tujuan", at: order.completedAt, done: ok },
      ]
    : [];

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <p className="text-xs tracking-[0.2em] text-mint uppercase">Lacak pesanan</p>
      <h1 className="hd mt-2 text-4xl font-extrabold md:text-5xl">Cek Transaksi</h1>
      <p className="mt-3 text-mut">
        Masukkan nomor pesanan (contoh: OVL-YYMMDD-XXXXXX) untuk melihat status pembayaran dan
        pengiriman produk.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void show(query);
        }}
        className="card mt-8 flex flex-col gap-3 p-5 sm:flex-row"
      >
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value.toUpperCase());
            if (error) setError("");
          }}
          autoComplete="off"
          aria-label="Nomor pesanan"
          placeholder="OVL-YYMMDD-XXXXXX"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg tracking-wide uppercase outline-none transition focus:border-lime"
        />
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer rounded-full bg-lime px-7 py-3 font-bold text-bg transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Mencari…" : "Cek status"}
        </button>
      </form>

      <div className="mt-6">
        {error ? (
          <div className="card p-6">
            <p className="hd text-xl font-bold">Periksa kembali</p>
            <p className="mt-2 text-sm text-mut">{error}</p>
          </div>
        ) : null}

        {notFound && query.trim() ? (
          <div className="card p-6">
            <p className="hd text-xl font-bold">Pesanan tidak ditemukan</p>
            <p className="mt-2 text-sm text-mut">
              Cek lagi nomor <b className="text-txt">{query.trim().toUpperCase()}</b>. Pastikan
              nomornya sesuai invoice yang kamu terima.
            </p>
            <Link href="/#layanan" className="mt-4 inline-block text-sm font-bold text-lime">
              Mulai pesanan baru →
            </Link>
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
              {order.sn ? <DetailRow label="SN / Token" value={order.sn} /> : null}
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
                Konfirmasi pembayaran sudah masuk. Admin sedang memeriksa sebelum pesanan diproses.
              </p>
            ) : order.status === "sukses" ? (
              <p className="mt-5 text-sm text-mint">
                Pesanan sudah selesai. SN atau token ada di detail transaksi di atas.
              </p>
            ) : (
              <p className="mt-5 text-sm text-danger">
                Pesanan dibatalkan. Silakan buat pesanan baru atau hubungi CS kami.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 py-2 text-sm">
      <span className="text-mut">{label}</span>
      <b className="text-right break-all">{value}</b>
    </div>
  );
}
