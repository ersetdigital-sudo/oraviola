import type { PaymentKind, PaymentMethod } from "@/types";

export const PAYMENT_SECTIONS: { key: PaymentKind; label: string }[] = [
  { key: "qris", label: "QRIS" },
  { key: "va", label: "Transfer Virtual Account" },
  { key: "ewallet", label: "E-Wallet" },
  { key: "retail", label: "Gerai Retail" },
];

/**
 * QR Code Standar (QRIS) milik merchant.
 * Sumber: Cloudinary — dipakai langsung supaya bisa di-update tanpa deploy.
 */
export const QRIS_IMAGE =
  "https://res.cloudinary.com/dqjh7utdb/image/upload/v1792161327/camhvfeu1lcm0ps8ieiz.jpg";

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "qris",
    name: "QRIS",
    kind: "qris",
    desc: "Scan pakai semua e-wallet & m-banking",
    fee: 0,
    enabled: true,
  },
  {
    id: "va-bca",
    name: "BCA Virtual Account",
    kind: "va",
    desc: "Cek otomatis",
    fee: 4000,
    logo: "/images/payments/bca.svg",
    vaPrefix: "39358",
    enabled: false,
  },
  {
    id: "va-bri",
    name: "BRI Virtual Account",
    kind: "va",
    desc: "Cek otomatis",
    fee: 4000,
    logo: "/images/payments/bri.svg",
    vaPrefix: "88810",
    enabled: false,
  },
  {
    id: "va-bni",
    name: "BNI Virtual Account",
    kind: "va",
    desc: "Cek otomatis",
    fee: 4000,
    logo: "/images/payments/bni.svg",
    vaPrefix: "98829",
    enabled: false,
  },
  {
    id: "va-mandiri",
    name: "Mandiri Virtual Account",
    kind: "va",
    desc: "Cek otomatis",
    fee: 4000,
    logo: "/images/payments/mandiri.svg",
    vaPrefix: "89508",
    enabled: false,
  },
  {
    id: "ew-dana",
    name: "DANA",
    kind: "ewallet",
    desc: "Bayar langsung di aplikasi",
    fee: 1500,
    logo: "/images/payments/dana.svg",
    enabled: false,
  },
  {
    id: "ew-ovo",
    name: "OVO",
    kind: "ewallet",
    desc: "Bayar langsung di aplikasi",
    fee: 1500,
    logo: "/images/payments/ovo.svg",
    enabled: false,
  },
  {
    id: "ew-gopay",
    name: "GoPay",
    kind: "ewallet",
    desc: "Bayar langsung di aplikasi",
    fee: 1500,
    logo: "/images/payments/gopay.png",
    enabled: false,
  },
  {
    id: "ew-shopeepay",
    name: "ShopeePay",
    kind: "ewallet",
    desc: "Bayar langsung di aplikasi",
    fee: 1500,
    logo: "/images/payments/shopeepay.svg",
    enabled: false,
  },
  {
    id: "rt-alfamart",
    name: "Alfamart",
    kind: "retail",
    desc: "Bayar di kasir",
    fee: 2500,
    logo: "/images/payments/alfamart.svg",
    enabled: false,
  },
  {
    id: "rt-indomaret",
    name: "Indomaret",
    kind: "retail",
    desc: "Bayar di kasir",
    fee: 2500,
    logo: "/images/payments/indomaret.png",
    enabled: false,
  },
];
