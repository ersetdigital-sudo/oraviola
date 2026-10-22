"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BrandImage } from "@/components/BrandImage";
import { PAYMENT_METHODS, PAYMENT_SECTIONS, QRIS_IMAGE } from "@/data/payments";
import { createRetailCode, createVaNumber, formatVaNumber, rp } from "@/lib/format";
import { saveOrder } from "@/lib/orders";
import type { PaymentMethod } from "@/types";

type Step = "method" | "instruction" | "diproses" | "success";

type PaymentModalProps = {
  open: boolean;
  onClose: () => void;
  /** judul layanan, mis. "Pulsa & Paket Data" */
  serviceTitle: string;
  /** label input, mis. "Nomor HP" */
  serviceLabel: string;
  /** nama produk terpilih */
  productName: string;
  /** harga produk (tanpa admin) */
  productPrice: number;
  /** nomor tujuan */
  target: string;
  /** id pesanan */
  orderId: string;
};

function Countdown({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          onExpire();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [onExpire]);

  if (left <= 0) return <b className="text-danger">Kedaluwarsa</b>;

  const hours = Math.floor(left / 3600);
  const minutes = Math.floor((left % 3600) / 60);
  const secs = left % 60;
  const text =
    (hours ? String(hours).padStart(2, "0") + ":" : "") +
    String(minutes).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0");

  return <b className="text-amber">{text}</b>;
}

export function PaymentModal({
  open,
  onClose,
  serviceTitle,
  serviceLabel,
  productName,
  productPrice,
  target,
  orderId,
}: PaymentModalProps) {
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [expired, setExpired] = useState(false);

  const total = useMemo(
    () => productPrice + (method?.fee ?? 0),
    [method, productPrice],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // reset setiap kali modal dibuka
  useEffect(() => {
    if (open) {
      setStep("method");
      setMethod(null);
      setCopied(null);
      setChecking(false);
      setExpired(false);
    }
  }, [open]);

  const vaNumber = method?.vaPrefix
    ? formatVaNumber(createVaNumber(method.vaPrefix, target))
    : "";

  const retailCode = useMemo(() => createRetailCode(), [step, method?.id]);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  const choose = (item: PaymentMethod) => {
    setMethod(item);
    setStep("instruction");
    setExpired(false);
    saveOrder({
      id: orderId,
      svc: serviceTitle,
      prod: productName,
      no: target,
      met: item.name,
      total: productPrice + item.fee,
      status: "menunggu",
      t: Date.now(),
    });
  };

  // User menekan "Saya sudah bayar": verifikasi dulu, lalu masuk tahap "diproses".
  const checkStatus = () => {
    setChecking(true);
    window.setTimeout(() => {
      setChecking(false);
      setStep("diproses");
      saveOrder({
        id: orderId,
        svc: serviceTitle,
        prod: productName,
        no: target,
        met: method?.name ?? "-",
        total,
        status: "diproses",
        t: Date.now(),
        paid: Date.now(),
      });
    }, 1200);
  };

  // Tahap "diproses" -&gt; selesai otomatis setelah jeda singkat.
  useEffect(() => {
    if (step !== "diproses") return;
    const timer = window.setTimeout(() => {
      setStep("success");
      saveOrder({
        id: orderId,
        svc: serviceTitle,
        prod: productName,
        no: target,
        met: method?.name ?? "-",
        total,
        status: "sukses",
        t: Date.now(),
        paid: Date.now(),
      });
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [step, orderId, serviceTitle, productName, target, method?.name, total]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Pembayaran"
        >
          <motion.div
            key="sheet"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[92vh] w-full max-w-[440px] overflow-y-auto rounded-3xl border border-lime/25 bg-panel p-5 text-txt"
          >
            {step === "method" && (
              <>
                <ModalHead label="PILIH METODE PEMBAYARAN" onClose={onClose} />

                <div className="grid gap-2 rounded-2xl bg-white/5 p-3.5 text-sm">
                  <Row label="Produk" value={productName} />
                  <Row label={serviceLabel} value={target} />
                  <Row label="Harga" value={rp(productPrice)} accent />
                </div>

                {PAYMENT_SECTIONS.map((section) => {
                  const items = PAYMENT_METHODS.filter((m) => m.kind === section.key);
                  if (items.length === 0) return null;

                  return (
                    <div key={section.key}>
                      <p className="mt-4 mb-2 text-xs font-bold text-mut">{section.label}</p>
                      <div className="grid gap-1.5">
                        {items.map((item) => {
                          const active = item.enabled !== false;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              disabled={!active}
                              onClick={() => choose(item)}
                              aria-disabled={!active}
                              className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                                active
                                  ? "cursor-pointer border-lime/15 bg-white/[0.02] hover:border-lime/50"
                                  : "cursor-not-allowed border-white/5 bg-white/[0.01] opacity-40"
                              }`}
                            >
                              <MethodBadge method={item} />
                              <span className="min-w-0 flex-1">
                                <b className="block text-[15px]">{item.name}</b>
                                <span className="text-xs text-mut">
                                  {active ? item.desc : "Segera hadir"}
                                </span>
                              </span>
                              <span className="shrink-0 text-xs whitespace-nowrap text-mut">
                                {active
                                  ? item.fee
                                    ? `+ ${rp(item.fee)}`
                                    : "Gratis biaya"
                                  : "Nonaktif"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {step === "instruction" && method && (
              <>
                <ModalHead onClose={onClose} onBack={() => setStep("method")} />

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <MethodBadge method={method} />
                    <div>
                      <p className="text-xs tracking-[0.1em] text-mint uppercase">{method.name}</p>
                      <p className="mt-0.5 text-xs text-mut">No. pesanan {orderId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-mut">Bayar sebelum</p>
                    <Countdown
                      seconds={method.kind === "qris" ? 900 : 86400}
                      onExpire={() => setExpired(true)}
                    />
                  </div>
                </div>

                <div className="my-4 flex items-center justify-between rounded-2xl border border-lime/25 bg-lime/8 px-3.5 py-3">
                  <span className="text-sm text-mut">Total bayar</span>
                  <b className="hd text-2xl text-lime">{rp(total)}</b>
                </div>

                {method.kind === "qris" && (
                  <div className="text-center">
                    <div className="inline-block overflow-hidden rounded-2xl bg-white p-2">
                      <Image
                        src={QRIS_IMAGE}
                        alt="QR Code Standar QRIS untuk pembayaran Oraviola"
                        width={1135}
                        height={1600}
                        priority
                        sizes="260px"
                        className="h-auto w-[260px] max-w-full"
                      />
                    </div>
                    <p className="mt-3 text-xs text-mut">
                      Scan pakai DANA, OVO, GoPay, ShopeePay, atau m-banking apa pun.
                    </p>
                  </div>
                )}

                {method.kind === "va" && (
                  <div>
                    <p className="text-xs text-mut">Nomor Virtual Account</p>
                    <div className="mt-1.5 flex items-center justify-between gap-3 rounded-2xl bg-white/6 px-3.5 py-3.5">
                      <b className="hd text-xl tracking-[0.04em]">{vaNumber}</b>
                      <button
                        type="button"
                        onClick={() => copy(vaNumber.replace(/\s/g, ""))}
                        className="shrink-0 cursor-pointer text-xs font-bold text-lime"
                      >
                        {copied === vaNumber.replace(/\s/g, "") ? "Tersalin ✓" : "Salin"}
                      </button>
                    </div>
                    <ol className="mt-3.5 grid list-decimal gap-1 pl-5 text-xs text-mut">
                      <li>Buka m-banking / ATM {method.name.split(" ")[0]}</li>
                      <li>Pilih Transfer → Virtual Account</li>
                      <li>Masukkan nomor di atas, cek nominal, lalu bayar</li>
                    </ol>
                  </div>
                )}

                {method.kind === "ewallet" && (
                  <div>
                    <p className="text-sm text-mut">
                      Kamu akan diarahkan ke aplikasi <b className="text-txt">{method.name}</b> untuk
                      menyelesaikan pembayaran.
                    </p>
                    <button
                      type="button"
                      onClick={(event) => {
                        const button = event.currentTarget;
                        button.textContent = `Menunggu pembayaran di ${method.name}…`;
                      }}
                      className="mt-3.5 w-full cursor-pointer rounded-full border border-mint py-3 font-extrabold text-mint transition hover:bg-mint/10"
                    >
                      Buka aplikasi {method.name}
                    </button>
                  </div>
                )}

                {method.kind === "retail" && (
                  <div>
                    <p className="text-xs text-mut">Kode pembayaran {method.name}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-3 rounded-2xl bg-white/6 px-3.5 py-3.5">
                      <b className="hd text-xl tracking-[0.04em]">{retailCode}</b>
                      <button
                        type="button"
                        onClick={() => copy(retailCode)}
                        className="shrink-0 cursor-pointer text-xs font-bold text-lime"
                      >
                        {copied === retailCode ? "Tersalin ✓" : "Salin"}
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-mut">
                      Tunjukkan kode ini ke kasir {method.name} dan bilang mau bayar “Oraviola”.
                    </p>
                  </div>
                )}

                <div className="mt-4 grid gap-1 text-xs text-mut">
                  <div className="flex justify-between gap-3">
                    <span>{productName}</span>
                    <span>{rp(productPrice)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Biaya layanan</span>
                    <span>{method.fee ? rp(method.fee) : "Gratis"}</span>
                  </div>
                </div>

                {expired && (
                  <p className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">
                    Waktu pembayaran habis. Silakan mulai ulang.
                  </p>
                )}

                <button
                  type="button"
                  onClick={checkStatus}
                  disabled={checking || expired}
                  className="mt-4 w-full cursor-pointer rounded-full bg-lime py-3.5 font-extrabold text-bg transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checking ? "Memverifikasi…" : "Saya sudah bayar"}
                </button>
              </>
            )}

            {step === "diproses" && (
              <>
                <ModalHead label="PEMBAYARAN DITERIMA" onClose={onClose} />

                <div className="px-2 py-2 text-center">
                  <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-lime/15">
                    <motion.span
                      className="block h-9 w-9 rounded-full border-3 border-lime border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <h3 className="hd mt-4 text-2xl font-extrabold">Terima kasih!</h3>
                  <p className="mt-1 text-sm text-mut">
                    Pembayaranmu telah diterima dan akan segera diproses.
                  </p>
                </div>

                <div className="mt-5 grid gap-2 rounded-2xl bg-white/5 p-3.5 text-sm">
                  <Row label="No. pesanan" value={orderId} />
                  <Row label="Produk" value={productName} />
                  <Row label={serviceLabel} value={target || "-"} />
                  <Row label="Total" value={rp(total)} accent />
                </div>

                <p className="mt-4 rounded-2xl border border-lime/25 bg-lime/8 px-3.5 py-3 text-sm text-mut">
                  Pesananmu sedang diproses di sisi kami. Mohon jangan tutup halaman ini,
                  proses berjalan otomatis.
                </p>

                <Link
                  href={`/cek?id=${orderId}`}
                  className="mt-4 block rounded-full border border-lime/40 py-3 text-center font-bold text-lime transition hover:bg-lime/10"
                >
                  Lihat di Cek Transaksi
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 w-full cursor-pointer rounded-full bg-lime py-3.5 font-extrabold text-bg transition hover:brightness-95"
                >
                  Selesai
                </button>
              </>
            )}

            {step === "success" && (
              <>
                <ModalHead label="PEMBAYARAN BERHASIL" onClose={onClose} />

                <div className="px-2 py-2 text-center">
                  <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-lime text-4xl font-extrabold text-bg">
                    ✓
                  </div>
                  <h3 className="hd mt-4 text-2xl font-extrabold">Transaksi berhasil!</h3>
                  <p className="mt-1 text-sm text-mut">
                    {productName} untuk {target} sudah diproses dan masuk ke akun kamu.
                  </p>
                </div>

                <div className="mt-5 grid gap-2 rounded-2xl bg-white/5 p-3.5 text-sm">
                  <Row label="No. pesanan" value={orderId} />
                  <Row label="Metode" value={method?.name ?? "-"} />
                  <Row label="Total" value={rp(total)} accent />
                </div>

                <Link
                  href={`/cek?id=${orderId}`}
                  className="mt-4 block rounded-full border border-lime/40 py-3 text-center font-bold text-lime transition hover:bg-lime/10"
                >
                  Lihat di Cek Transaksi
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 w-full cursor-pointer rounded-full bg-lime py-3.5 font-extrabold text-bg transition hover:brightness-95"
                >
                  Selesai
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalHead({
  label,
  onClose,
  onBack,
}: {
  label?: string;
  onClose: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer font-bold text-mut transition hover:text-txt"
        >
          ← Kembali
        </button>
      ) : (
        <p className="text-xs tracking-[0.1em] text-mint">{label}</p>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup"
        className="cursor-pointer text-2xl leading-none text-mut transition hover:text-txt"
      >
        ×
      </button>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-mut">{label}</span>
      <b className={`text-right ${accent ? "text-lime" : ""}`}>{value}</b>
    </div>
  );
}

function MethodBadge({ method }: { method: PaymentMethod }) {
  return (
    <span className="relative flex h-11 w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white px-2">
      {method.kind === "qris" ? (
        <span className="font-sans text-[15px] font-black tracking-[0.02em] text-black">
          QR<span className="text-[#E2231A]">IS</span>
        </span>
      ) : method.logo ? (
        <BrandImage
          src={method.logo}
          alt={method.name}
          sizes="60px"
          className="object-contain"
        />
      ) : (
        <span className="text-xs font-bold text-black">{method.name}</span>
      )}
    </span>
  );
}
