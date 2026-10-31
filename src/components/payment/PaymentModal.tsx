"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BrandImage } from "@/components/BrandImage";
import { QRIS_IMAGE } from "@/data/payments";
import { checkVoucher, createOrder, getPayment } from "@/lib/db/client";
import { toPublicError } from "@/lib/db/errors";
import { createVaNumber, formatVaNumber, rp } from "@/lib/format";

type Step = "method" | "instruction" | "diproses" | "success";

type CheckoutMethod = {
  id: string;
  name: string;
  fee: number;
  type: "qr" | "ewallet" | "va";
};

type AppliedVoucher = {
  code: string;
  potongan: number;
  label: string;
};

type PaymentModalProps = {
  open: boolean;
  onClose: () => void;
  /** judul layanan, mis. "Pulsa & Paket Data" */
  serviceTitle: string;
  /** label input, mis. "Nomor HP" */
  serviceLabel: string;
  /** id layanan Supabase */
  serviceId: string | null;
  /** id produk Supabase */
  productId: string | null;
  /** nama produk terpilih */
  productName: string;
  /** harga produk (tanpa admin) */
  productPrice: number;
  /** nomor tujuan */
  target: string;
  /** data field tambahan (game, dll.) */
  input: Record<string, string>;
  brandSlug: string;
  methods: CheckoutMethod[];
  qrisImageUrl: string | null;
};

const SECTIONS: { key: CheckoutMethod["type"]; label: string }[] = [
  { key: "qr", label: "QRIS" },
  { key: "va", label: "Transfer Virtual Account" },
  { key: "ewallet", label: "E-Wallet" },
];

const METHOD_LOGOS: Record<string, string> = {
  "BCA Virtual Account": "/images/payments/bca.svg",
  "BRI Virtual Account": "/images/payments/bri.svg",
  "BNI Virtual Account": "/images/payments/bni.svg",
  "Mandiri Virtual Account": "/images/payments/mandiri.svg",
  DANA: "/images/payments/dana.svg",
  OVO: "/images/payments/ovo.svg",
  GoPay: "/images/payments/gopay.png",
  ShopeePay: "/images/payments/shopeepay.svg",
};

function property(value: number) {
  return Math.max(0, value);
}

function Countdown({ expiresAt, onExpire }: { expiresAt: number; onExpire: () => void }) {
  const [left, setLeft] = useState(() => Math.max(0, expiresAt - Date.now()));

  useEffect(() => {
    const tick = () => {
      const next = Math.max(0, expiresAt - Date.now());
      setLeft(next);
      if (next <= 0) onExpire();
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (left <= 0) return <b className="text-danger">Kedaluwarsa</b>;

  const hours = Math.floor(left / 3600000);
  const minutes = Math.floor((left % 3600000) / 60000);
  const secs = Math.floor((left % 60000) / 1000);
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
  serviceId,
  productId,
  productName,
  productPrice,
  target,
  input,
  brandSlug,
  methods,
  qrisImageUrl,
}: PaymentModalProps) {
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<CheckoutMethod | null>(null);
  const [invoice, setInvoice] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);
  const [expiresAt, setExpiresAt] = useState(0);
  const [sn, setSn] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [expired, setExpired] = useState(false);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);
  const [promoError, setPromoError] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  const discount = appliedVoucher?.potongan ?? 0;
  const total = property(productPrice + (method?.fee ?? 0) - discount);
  const displayTotal = invoice ? orderTotal : total;

  const handleExpire = useCallback(() => setExpired(true), []);

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

  useEffect(() => {
    if (open) {
      setStep("method");
      setMethod(null);
      setInvoice("");
      setOrderTotal(0);
      setExpiresAt(0);
      setSn(null);
      setCopied(null);
      setChecking(false);
      setExpired(false);
      setCreatingId(null);
      setError("");
      setPromoInput("");
      setAppliedVoucher(null);
      setPromoError("");
      setApplyingPromo(false);
    }
  }, [open]);

  useEffect(() => {
    if (step !== "diproses" || !invoice) return;
    const timer = window.setInterval(async () => {
      try {
        const payment = await getPayment(invoice);
        if (payment.status === "sukses") {
          setStep("success");
          window.clearInterval(timer);
          try {
            const response = await fetch(`/api/orders/${encodeURIComponent(invoice)}`, {
              headers: { accept: "application/json" },
            });
            if (response.ok) {
              const data = (await response.json()) as { sn?: string | null };
              setSn(data.sn ?? null);
            }
          } catch {
            /* SN akan tampil di halaman cek transaksi */
          }
        } else if (payment.status === "dibatalkan") {
          setStep("method");
          setError("Transaksi dibatalkan. Silakan buat pesanan baru.");
          window.clearInterval(timer);
        }
      } catch {
        /* coba lagi di interval berikutnya */
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [step, invoice]);

  const vaNumber = method?.type === "va" ? formatVaNumber(createVaNumber("8000", target)) : "";

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  async function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    setPromoError("");
    if (!code) {
      setPromoError("Masukkan kode promo terlebih dahulu.");
      return;
    }
    if (!serviceId) {
      setPromoError("Pembayaran belum tersedia. Coba lagi sebentar.");
      return;
    }

    setApplyingPromo(true);
    try {
      const result = await checkVoucher({
        brandSlug,
        code,
        serviceId,
        subtotal: productPrice,
      });
      if (!result.valid) {
        setPromoError(result.pesan || "Kode promo tidak valid.");
        return;
      }
      setAppliedVoucher({
        code,
        potongan: result.potongan,
        label: `Potongan ${rp(result.potongan)}`,
      });
      setPromoInput(code);
    } catch (promoFailure) {
      setPromoError(toPublicError(promoFailure).message);
    } finally {
      setApplyingPromo(false);
    }
  }

  function removePromo() {
    setAppliedVoucher(null);
    setPromoInput("");
    setPromoError("");
  }

  async function choose(item: CheckoutMethod) {
    if (!serviceId || !productId || !brandSlug) {
      setError("Pembayaran belum tersedia. Coba lagi sebentar.");
      return;
    }

    setError("");
    setCreatingId(item.id);
    try {
      const created = await createOrder({
        brandSlug,
        serviceId,
        productId,
        nomorTujuan: target,
        input: { ...input, nomor_tujuan: target },
        paymentMethodId: item.id,
        voucherCode: appliedVoucher?.code ?? null,
      });
      setMethod(item);
      setInvoice(created.ref);
      setOrderTotal(created.total);
      setExpiresAt(new Date(created.expires_at).getTime());
      setExpired(false);
      setStep("instruction");
    } catch (creationFailure) {
      setError(toPublicError(creationFailure).message);
    } finally {
      setCreatingId(null);
    }
  }

  function checkStatus() {
    setChecking(true);
    window.setTimeout(() => {
      setChecking(false);
      setStep("diproses");
    }, 700);
  }

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
                  {discount > 0 && (
                    <Row label={`Promo ${appliedVoucher?.code ?? ""}`} value={`- ${rp(discount)}`} />
                  )}
                </div>

                <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
                  <p className="text-xs font-bold text-mut">Kode promo</p>
                  {appliedVoucher ? (
                    <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-lime/10 px-3 py-2">
                      <span className="text-xs font-bold text-lime">
                        {appliedVoucher.code} · {appliedVoucher.label}
                      </span>
                      <button
                        type="button"
                        onClick={removePromo}
                        className="cursor-pointer text-xs font-bold text-mut hover:text-txt"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mt-2 flex gap-2">
                        <input
                          value={promoInput}
                          onChange={(event) => {
                            setPromoInput(event.target.value.toUpperCase());
                            if (promoError) setPromoError("");
                          }}
                          autoComplete="off"
                          aria-label="Kode promo"
                          placeholder="Contoh: ORAVIOLA10"
                          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm uppercase outline-none transition focus:border-lime"
                        />
                        <button
                          type="button"
                          onClick={() => void applyPromo()}
                          disabled={applyingPromo}
                          className="shrink-0 cursor-pointer rounded-xl border border-lime/40 px-4 text-xs font-bold text-lime transition hover:bg-lime/10 disabled:opacity-50"
                        >
                          {applyingPromo ? "…" : "Pakai"}
                        </button>
                      </div>
                      {promoError ? (
                        <p className="mt-2 text-[11px] text-danger">{promoError}</p>
                      ) : (
                        <p className="mt-2 text-[11px] text-mut">
                          ORAVIOLA10 berlaku untuk token PLN (maks. Rp10.000).
                        </p>
                      )}
                    </>
                  )}
                </div>

                {SECTIONS.map((section) => {
                  const items = methods.filter((item) => item.type === section.key);
                  if (items.length === 0) return null;

                  return (
                    <div key={section.key}>
                      <p className="mt-4 mb-2 text-xs font-bold text-mut">{section.label}</p>
                      <div className="grid gap-1.5">
                        {items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            disabled={Boolean(creatingId)}
                            onClick={() => void choose(item)}
                            className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-lime/15 bg-white/[0.02] p-3 text-left transition hover:border-lime/50 disabled:cursor-wait disabled:opacity-60"
                          >
                            <MethodBadge method={item} />
                            <span className="min-w-0 flex-1">
                              <b className="block text-[15px]">{item.name}</b>
                              <span className="text-xs text-mut">
                                {creatingId === item.id
                                  ? "Membuat pesanan…"
                                  : item.type === "qr"
                                    ? "Scan pakai semua e-wallet & m-banking"
                                    : "Bayar lewat kanal resmi"}
                              </span>
                            </span>
                            <span className="shrink-0 text-xs whitespace-nowrap text-mut">
                              {item.fee ? `+ ${rp(item.fee)}` : "Gratis biaya"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {error ? (
                  <p className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">
                    {error}
                  </p>
                ) : null}
              </>
            )}

            {step === "instruction" && method && (
              <>
                <ModalHead onClose={onClose} />

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <MethodBadge method={method} />
                    <div>
                      <p className="text-xs tracking-[0.1em] text-mint uppercase">{method.name}</p>
                      <p className="mt-0.5 text-xs text-mut">No. pesanan {invoice}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-mut">Bayar sebelum</p>
                    <Countdown key={invoice} expiresAt={expiresAt} onExpire={handleExpire} />
                  </div>
                </div>

                <div className="my-4 flex items-center justify-between rounded-2xl border border-lime/25 bg-lime/8 px-3.5 py-3">
                  <span className="text-sm text-mut">Total bayar</span>
                  <b className="hd text-2xl text-lime">{rp(displayTotal)}</b>
                </div>

                {method.type === "qr" && (
                  <div className="text-center">
                    <div className="inline-block overflow-hidden rounded-2xl bg-white p-2">
                      <Image
                        src={qrisImageUrl || QRIS_IMAGE}
                        alt="Kode QRIS untuk pembayaran Oraviola"
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

                {method.type === "va" && (
                  <div>
                    <p className="text-xs text-mut">Nomor Virtual Account</p>
                    <div className="mt-1.5 flex items-center justify-between gap-3 rounded-2xl bg-white/6 px-3.5 py-3.5">
                      <b className="hd text-xl tracking-[0.04em]">{vaNumber}</b>
                      <button
                        type="button"
                        onClick={() => void copy(vaNumber.replace(/\s/g, ""))}
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

                {method.type === "ewallet" && (
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

                <div className="mt-4 grid gap-1 text-xs text-mut">
                  <div className="flex justify-between gap-3">
                    <span>{productName}</span>
                    <span>{rp(productPrice)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Biaya layanan</span>
                    <span>{method.fee ? rp(method.fee) : "Gratis"}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between gap-3 text-lime">
                      <span>Promo {appliedVoucher?.code ?? ""}</span>
                      <span>- {rp(discount)}</span>
                    </div>
                  )}
                </div>

                {expired && (
                  <p className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">
                    Waktu pembayaran habis. Silakan mulai ulang.
                  </p>
                )}

                {error ? (
                  <p className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger">
                    {error}
                  </p>
                ) : null}

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
                <ModalHead label="MENUNGGU VERIFIKASI ADMIN" onClose={onClose} />

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
                    Konfirmasi pembayaranmu sudah kami terima. Admin sedang memeriksa pembayaran
                    sebelum pesanan diproses.
                  </p>
                </div>

                <div className="mt-5 grid gap-2 rounded-2xl bg-white/5 p-3.5 text-sm">
                  <Row label="No. pesanan" value={invoice} />
                  <Row label="Produk" value={productName} />
                  <Row label={serviceLabel} value={target || "-"} />
                  <Row label="Total" value={rp(displayTotal)} accent />
                </div>

                <p className="mt-4 rounded-2xl border border-lime/25 bg-lime/8 px-3.5 py-3 text-sm text-mut">
                  Status akan berubah otomatis setelah admin menandai pembayaran. Kamu bisa
                  memantau lewat halaman Cek Transaksi.
                </p>

                <Link
                  href={`/cek?id=${encodeURIComponent(invoice)}`}
                  className="mt-4 block rounded-full border border-lime/40 py-3 text-center font-bold text-lime transition hover:bg-lime/10"
                >
                  Lihat di Cek Transaksi
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 w-full cursor-pointer rounded-full bg-lime py-3.5 font-extrabold text-bg transition hover:brightness-95"
                >
                  Tutup
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
                    {productName} untuk {target} sudah diproses.
                  </p>
                </div>

                <div className="mt-5 grid gap-2 rounded-2xl bg-white/5 p-3.5 text-sm">
                  <Row label="No. pesanan" value={invoice} />
                  <Row label="Metode" value={method?.name ?? "-"} />
                  <Row label="Total" value={rp(displayTotal)} accent />
                  {sn ? <Row label="SN / Token" value={sn} accent /> : null}
                </div>

                <Link
                  href={`/cek?id=${encodeURIComponent(invoice)}`}
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

function MethodBadge({ method }: { method: CheckoutMethod }) {
  return (
    <span className="relative flex h-11 w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white px-2">
      {method.type === "qr" ? (
        <span className="font-sans text-[15px] font-black tracking-[0.02em] text-black">
          QR<span className="text-[#E2231A]">IS</span>
        </span>
      ) : METHOD_LOGOS[method.name] ? (
        <BrandImage
          src={METHOD_LOGOS[method.name]}
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
