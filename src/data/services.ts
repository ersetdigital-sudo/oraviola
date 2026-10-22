import type { Service, ServiceCategory } from "@/types";

export const SERVICE_FILTERS: { key: "all" | ServiceCategory; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "isi", label: "Isi Ulang" },
  { key: "listrik", label: "Listrik" },
  { key: "tagihan", label: "Tagihan" },
];

export const SERVICES: Service[] = [
  {
    slug: "pulsa",
    name: "Pulsa",
    description: "Mulai Rp 6.500",
    href: "/pulsa",
    category: "isi",
    accent: "#D6FF63",
    icon: "phone",
    badge: "LARIS",
  },
  {
    slug: "paket-data",
    name: "Paket Data",
    description: "Mulai Rp 5.000",
    href: "/pulsa",
    category: "isi",
    accent: "#5BE3B0",
    icon: "wifi",
    badge: "LARIS",
  },
  {
    slug: "ewallet",
    name: "E-Wallet",
    description: "9 e-wallet · Mulai Rp 11.000",
    href: "/ewallet",
    category: "isi",
    accent: "#7FD4FF",
    icon: "wallet",
  },
  {
    slug: "game",
    name: "Top Up Game",
    description: "12 game · Mulai Rp 5.000",
    href: "/game",
    category: "isi",
    accent: "#FF8FD8",
    icon: "gamepad",
    badge: "LARIS",
  },
  {
    slug: "token-pln",
    name: "Token PLN",
    description: "Mulai Rp 21.500",
    href: "/pln",
    category: "listrik",
    accent: "#FFD25C",
    icon: "bolt",
    badge: "LARIS",
  },
  {
    slug: "tagihan-pln",
    name: "Tagihan PLN",
    description: "Admin Rp 2.500",
    href: "/pln",
    category: "listrik",
    accent: "#FFB35C",
    icon: "document",
  },
  {
    slug: "bpjs",
    name: "BPJS Kesehatan",
    description: "Iuran mulai Rp 44.500",
    href: "/bpjs",
    category: "tagihan",
    accent: "#5BE3B0",
    icon: "shield",
  },
  {
    slug: "pdam",
    name: "PDAM",
    description: "Tagihan air mulai Rp 45.000",
    href: "/pdam",
    category: "tagihan",
    accent: "#7FD4FF",
    icon: "drop",
  },
  {
    slug: "internet-tv",
    name: "Internet & TV",
    description: "Mulai Rp 125.000",
    href: "/tagihan",
    category: "tagihan",
    accent: "#B9A8FF",
    icon: "tv",
  },
];

export const STEPS = [
  { title: "Pilih produk", desc: "Pulsa, token, game, atau tagihan." },
  { title: "Isi nomor & nominal", desc: "Operator terdeteksi otomatis." },
  { title: "Bayar, beres", desc: "QRIS, VA bank, atau e-wallet." },
] as const;

export const TESTIMONIALS = [
  {
    quote: "Token PLN tengah malam masuk dalam hitungan detik. Penyelamat.",
    author: "Rina, Bandung",
  },
  {
    quote: "Top up diamond paling cepat yang pernah aku coba, harganya juga masuk akal.",
    author: "Dimas, Surabaya",
  },
  {
    quote: "Bayar BPJS dan PDAM sekeluarga cukup di satu tempat. Praktis.",
    author: "Pak Hendra, Medan",
  },
] as const;

export const FAQS = [
  {
    q: "Perlu daftar akun?",
    a: "Tidak. Cukup isi nomor dan bayar.",
  },
  {
    q: "Berapa lama prosesnya?",
    a: "Rata-rata 3 detik setelah pembayaran terkonfirmasi.",
  },
  {
    q: "Kalau transaksi gagal?",
    a: "Dana dikembalikan otomatis, dan tim kami siap bantu 24 jam.",
  },
  {
    q: "Metode pembayaran apa saja?",
    a: "QRIS, virtual account bank, dan e-wallet.",
  },
] as const;
