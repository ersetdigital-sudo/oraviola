export const SITE = {
  name: "Oraviola",
  tagline: "Bayar & Isi Ulang Digital, Tenang dan Cepat",
  description:
    "Pulsa, paket data, token PLN, e-wallet, top up game, sampai BPJS & PDAM. Harga jujur, tanpa daftar, langsung masuk.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://oraviola.com",
  locale: "id_ID",
  waNumber: "6285711172317",
  email: "halo@oraviola.com",
  address: "",
} as const;

export const NAV_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Layanan", href: "/#layanan" },
  { label: "Isi Ulang", href: "/#isi" },
  { label: "Promo", href: "/#promo" },
  { label: "FAQ", href: "/#faq" },
] as const;

export const MARQUEE_ITEMS = [
  "TELKOMSEL",
  "XL",
  "INDOSAT",
  "TRI",
  "SMARTFREN",
  "PLN",
  "BPJS",
  "DANA",
  "OVO",
  "GOPAY",
  "SHOPEEPAY",
  "MOBILE LEGENDS",
  "FREE FIRE",
  "PUBG",
  "GENSHIN",
] as const;

export const STATS = [
  { value: "1,2jt+", label: "transaksi sukses" },
  { value: "4.9/5", label: "rating pelanggan" },
  { value: "99,8%", label: "uptime" },
] as const;

export const PROMO_CODE = "ORAVIOLA10";

/** Tagihan yang masih menunggu dibayar — dipakai di mockup card hero. */
export const ACTIVE_BILLS = [
  { name: "Token PLN 200rb", meta: "PLN Pascabayar", amount: 201500 },
  { name: "BPJS Kesehatan", meta: "Iuran 1 bulan", amount: 42000 },
  { name: "PDAM", meta: "Tagihan Desember", amount: 28000 },
] as const;

