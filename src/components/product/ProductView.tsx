"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BrandImage } from "@/components/BrandImage";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { OPERATORS, detectOperator } from "@/data/operators";
import { createOrderId, rp } from "@/lib/format";
import type { ProductCatalog, ProductField, ProductItem } from "@/types";

type Selection = { group: number; item: number };

type ProductViewProps = {
  catalog: ProductCatalog;
  /** nomor tujuan dari query string */
  initialNumber?: string;
  /** nominal terpilih dari query string */
  initialNominal?: string;
};

function findByNominal(catalog: ProductCatalog, nominal: string): Selection | null {
  const n = Number(nominal);
  if (!Number.isFinite(n)) return null;

  const candidates = [n * 1000 + 1500, n * 300, n * 1000, n];
  for (let g = 0; g < catalog.groups.length; g++) {
    const index = catalog.groups[g].items.findIndex((item) => candidates.includes(item.price));
    if (index >= 0) return { group: g, item: index };
  }
  return null;
}

/** Isi awal field dari query string, mis. "12345678 (1234)" -> User ID + Zone ID. */
function seedValues(fields: ProductField[], raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  const trimmed = raw.trim();
  const digits = trimmed.match(/\d+/g) ?? [];

  fields.forEach((field, index) => {
    if (field.type === "select") {
      out[field.key] = field.defaultValue ?? field.options?.[0] ?? "";
      return;
    }
    if (!trimmed) return;
    if (fields.length === 1) {
      out[field.key] = field.type === "number" ? (digits[0] ?? "") : trimmed;
    } else if (digits[index]) {
      out[field.key] = digits[index];
    }
  });

  return out;
}

/** Gabungkan nilai field jadi satu string tujuan, mis. "12345678 (1234)". */
function composeTarget(fields: ProductField[], values: Record<string, string>): string {
  if (fields.length === 0) return "Dikirim otomatis";
  const parts: string[] = [];
  for (const field of fields) {
    const value = (values[field.key] ?? "").trim();
    // Kalau field wajibnya kosong, berhenti — jangan tampilkan field berikutnya.
    if (!value) {
      if (field.required !== false) break;
      continue;
    }
    parts.push(`${field.prefix ?? ""}${value}${field.suffix ?? ""}`);
  }
  return parts.join(" ");
}

export function ProductView({ catalog, initialNumber = "", initialNominal }: ProductViewProps) {
  const [initialSelection] = useState(() =>
    initialNominal ? findByNominal(catalog, initialNominal) : null,
  );

  const [number, setNumber] = useState(initialNumber);
  const [activeGroup, setActiveGroup] = useState(initialSelection?.group ?? 0);
  const [selected, setSelected] = useState<Selection | null>(initialSelection);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [orderId, setOrderId] = useState(() => createOrderId());

  const activeGroupDef = catalog.groups[activeGroup];
  /** Katalog dengan `fields` per group (game) punya form sendiri per tab. */
  const groupFields = activeGroupDef?.fields;
  const isDynamic = groupFields !== undefined;

  const [values, setValues] = useState<Record<string, string>>(() =>
    isDynamic ? seedValues(groupFields ?? [], initialNumber) : {},
  );

  const operator = useMemo(
    () => (catalog.detectOperator ? detectOperator(number) : null),
    [catalog.detectOperator, number],
  );

  const selectedItem: ProductItem | null = useMemo(() => {
    if (!selected) return null;
    return catalog.groups[selected.group]?.items[selected.item] ?? null;
  }, [catalog.groups, selected]);

  const switchGroup = (index: number) => {
    setActiveGroup(index);
    setSelected(null);
    setError(null);

    // Mulai bersih: ID game sebelumnya tidak boleh ikut ke game lain.
    const nextFields = catalog.groups[index]?.fields;
    if (nextFields) {
      const fresh: Record<string, string> = {};
      for (const field of nextFields) {
        if (field.type === "select") {
          fresh[field.key] = field.defaultValue ?? field.options?.[0] ?? "";
        }
      }
      setValues(fresh);
    }
  };

  const choose = (group: number, item: number) => {
    setSelected({ group, item });
    setError(null);
  };

  const setValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const target = isDynamic ? composeTarget(groupFields ?? [], values) : number.trim();

  const targetLabel = isDynamic
    ? groupFields && groupFields.length > 0
      ? groupFields.map((field) => field.label).join(" + ")
      : (activeGroupDef?.targetLabel ?? "Pengiriman")
    : catalog.label;

  const openPayment = () => {
    if (isDynamic) {
      const missing = (groupFields ?? []).filter(
        (field) => field.required !== false && !(values[field.key] ?? "").trim(),
      );
      if (missing.length > 0) {
        setError(`Isi ${missing.map((field) => field.label).join(" & ")} dulu ya.`);
        return;
      }
    } else if (!number.trim()) {
      setError(`Isi ${catalog.label.toLowerCase()} dulu ya.`);
      return;
    }
    if (!selectedItem) {
      setError("Pilih produknya dulu ya.");
      return;
    }
    setError(null);
    setOrderId(createOrderId());
    setModalOpen(true);
  };

  return (
    <>
      <main className="mx-auto grid max-w-6xl items-start gap-x-8 gap-y-6 px-5 py-10 pb-28 lg:grid-cols-[380px_1fr] lg:grid-rows-[auto_1fr] lg:pb-10">
        <div className="space-y-4">
          <div className="card bg-gradient-to-br from-[#16362B] to-panel p-5 sm:p-6">
            <p className="text-xs tracking-[0.2em] text-mint uppercase">Layanan</p>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">{catalog.title}</h1>
            <p className="mt-2 text-xs text-mut sm:mt-3 sm:text-sm">{catalog.desc}</p>
          </div>

          <div className="card p-6">
            <p className="text-sm font-bold">
              <span className="text-lime">1.</span> {targetLabel}
            </p>

            {isDynamic ? (
              groupFields && groupFields.length > 0 ? (
                <div className="mt-3 grid gap-3">
                  {groupFields.map((field) => (
                    <div key={field.key}>
                      <label
                        htmlFor={`field-${field.key}`}
                        className="mb-1.5 block text-xs text-mut"
                      >
                        {field.label}
                      </label>
                      {field.type === "select" ? (
                        <div className="relative">
                          <select
                            id={`field-${field.key}`}
                            value={values[field.key] ?? ""}
                            onChange={(event) => setValue(field.key, event.target.value)}
                            className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-lg outline-none transition focus:border-lime [&>option]:bg-panel [&>option]:text-txt"
                          >
                            {field.options?.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-mut"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </div>
                      ) : (
                        <input
                          id={`field-${field.key}`}
                          value={values[field.key] ?? ""}
                          onChange={(event) => setValue(field.key, event.target.value)}
                          inputMode={field.type === "number" ? "numeric" : "text"}
                          autoComplete="off"
                          placeholder={field.placeholder}
                          aria-label={field.label}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg outline-none transition focus:border-lime"
                        />
                      )}
                      {field.hint ? (
                        <p className="mt-1.5 text-[11px] text-mut">{field.hint}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-mut">
                  {activeGroupDef?.note ?? "Kode dikirim otomatis setelah pembayaran."}
                </p>
              )
            ) : (
              <>
                <div className="relative mt-3">
                  <input
                    value={number}
                    onChange={(event) => setNumber(event.target.value)}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={catalog.placeholder}
                    aria-label={catalog.label}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-[110px] text-lg outline-none transition focus:border-lime"
                  />
                  {operator?.logo ? (
                    <span className="absolute top-1/2 right-2 flex h-[34px] w-[92px] -translate-y-1/2 items-center justify-center rounded-lg bg-white px-2">
                      <BrandImage
                        src={operator.logo}
                        alt={operator.name}
                        sizes="84px"
                        className="object-contain"
                      />
                    </span>
                  ) : null}
                </div>

                {catalog.detectOperator ? (
                  operator ? (
                    <p className="mt-2 text-[13px] text-mint">
                      ✓ Terdeteksi: <b>{operator.name}</b>
                    </p>
                  ) : number.replace(/\D/g, "").length >= 4 ? (
                    <p className="mt-2 text-[13px] text-danger">
                      Operator tidak dikenali, cek lagi nomornya.
                    </p>
                  ) : null
                ) : null}
              </>
            )}

            {catalog.detectOperator && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {OPERATORS.map((op) => {
                  const isActive = operator?.name === op.name;
                  return (
                    <div
                      key={op.name}
                      title={op.name}
                      className={`relative flex h-[46px] items-center justify-center rounded-xl border-2 bg-white px-2 transition ${
                        isActive
                          ? "border-lime opacity-100 shadow-[0_0_0_3px_rgba(214,255,99,0.25)]"
                          : "border-transparent opacity-35 grayscale"
                      }`}
                    >
                      {op.logo ? (
                        <BrandImage
                          src={op.logo}
                          alt={op.name}
                          sizes="72px"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span
                          className="rounded px-1.5 py-0.5 text-[11px] font-black text-white"
                          style={{ background: op.color }}
                        >
                          tri.
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <p className="mb-5 text-sm font-bold">
            <span className="text-lime">2.</span> Pilih produk
          </p>

          {catalog.tabs && (
            <div
              className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1.5"
              role="tablist"
              aria-label="Pilih kategori produk"
            >
              {catalog.groups.map((group, index) => (
                <button
                  key={group.name}
                  type="button"
                  role="tab"
                  aria-selected={activeGroup === index}
                  onClick={() => switchGroup(index)}
                  className={`shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm font-bold whitespace-nowrap transition ${
                    activeGroup === index
                      ? "border-lime bg-lime text-bg"
                      : "border-lime/25 text-txt hover:border-lime/60"
                  }`}
                >
                  {group.name}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={catalog.tabs ? activeGroup : "all"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="grid gap-8"
            >
              {catalog.groups.map((group, groupIndex) => {
                if (catalog.tabs && groupIndex !== activeGroup) return null;

                return (
                  <section key={group.name}>
                    <div className="mb-3 flex items-baseline justify-between gap-3">
                      <h2 className="text-lg font-bold">{group.name}</h2>
                      {group.note ? <span className="text-xs text-mut">{group.note}</span> : null}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {group.items.map((item, itemIndex) => {
                        const isSelected =
                          selected?.group === groupIndex && selected?.item === itemIndex;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => choose(groupIndex, itemIndex)}
                            aria-pressed={isSelected}
                            className={`flex flex-col rounded-2xl border p-3 text-left transition ${
                              isSelected
                                ? "border-lime bg-lime/10 shadow-[0_0_0_3px_rgba(214,255,99,0.14)]"
                                : "border-white/10 bg-panel hover:border-lime/50 hover:bg-white/5"
                            }`}
                          >
                            <span className="text-sm leading-tight font-bold">{item.name}</span>
                            {item.note ? (
                              <span className="mt-1 text-[11px] leading-tight text-mut">
                                {item.note}
                              </span>
                            ) : null}
                            <span className="mt-auto pt-1.5 font-bold text-lime">
                              {rp(item.price)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="card hidden p-6 lg:sticky lg:top-24 lg:block">
          <p className="text-sm font-bold">
            <span className="text-lime">3.</span> Ringkasan
          </p>

          <div className="mt-3 grid gap-2 rounded-xl bg-white/5 p-4 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-mut">Produk</span>
              <span className="font-bold text-right">{selectedItem?.name ?? "-"}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-white/10 pt-2">
              <span className="text-mut">{targetLabel}</span>
              <span className="font-bold text-right">{target || "-"}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-white/10 pt-2">
              <span className="text-mut">Total</span>
              <span className="hd text-xl font-bold text-lime">
                {rp(selectedItem?.price ?? 0)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={openPayment}
            className="mt-5 w-full cursor-pointer rounded-full bg-lime py-3.5 font-bold text-bg transition hover:brightness-95"
          >
            Bayar sekarang
          </button>

          {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        </div>
      </main>

      {/* Action bar mobile: pilih produk + total selalu kelihatan tanpa scroll jauh */}
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        {error ? (
          <p className="mx-5 mb-2 rounded-xl bg-danger/12 px-3 py-2 text-center text-xs text-danger">
            {error}
          </p>
        ) : null}

        <div className="border-t border-white/10 bg-bg/95 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs text-mut">
                {selectedItem?.name ?? "Belum ada produk dipilih"}
              </p>
              <p className="hd text-xl font-bold text-lime">{rp(selectedItem?.price ?? 0)}</p>
            </div>
            <button
              type="button"
              onClick={openPayment}
              className="shrink-0 cursor-pointer rounded-full bg-lime px-7 py-3 font-bold text-bg transition hover:brightness-95"
            >
              Bayar
            </button>
          </div>
        </div>
      </div>

      <PaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceTitle={catalog.title}
        serviceLabel={targetLabel}
        productName={selectedItem?.name ?? "-"}
        productPrice={selectedItem?.price ?? 0}
        target={target}
        orderId={orderId}
      />
    </>
  );
}
