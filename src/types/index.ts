export type ServiceCategory = "isi" | "listrik" | "tagihan";

export interface Service {
  /** id|url slug */
  slug: string;
  name: string;
  description: string;
  href: string;
  category: ServiceCategory;
  /** warna aksen ikon */
  accent: string;
  /** nama ikon dari components/icons */
  icon: IconName;
  /** label kecil di atas deskripsi, mis. "LARIS" */
  badge?: string;
}

export type IconName =
  | "phone"
  | "wifi"
  | "wallet"
  | "gamepad"
  | "bolt"
  | "document"
  | "shield"
  | "drop"
  | "tv";

export interface ProductItem {
  name: string;
  price: number;
  note?: string;
}

/** Satu field input pada form produk (dipakai katalog game). */
export interface ProductField {
  /** kunci unik, mis. "userId" */
  key: string;
  /** label input, mis. "User ID" */
  label: string;
  /** placeholder input; opsional untuk select */
  placeholder?: string;
  /** "number" = hanya angka, "text" = bebas (Riot ID, username) */
  type?: "number" | "text" | "select";
  /** pilihan untuk type "select", mis. server game */
  options?: string[];
  /** nilai awal untuk type "select" */
  defaultValue?: string;
  /** wajib diisi sebelum bayar (default true) */
  required?: boolean;
  /** petunjuk kecil di bawah input */
  hint?: string;
  /** pembungkus saat digabung ke tujuan, mis. "(" + ")" */
  prefix?: string;
  suffix?: string;
}

export interface ProductGroup {
  name: string;
  note?: string;
  items: ProductItem[];
  /** field form khusus untuk group ini; menimpa `catalog.fields` */
  fields?: ProductField[];
  /** label yang dipakai di ringkasan & modal, mis. "Kode voucher" */
  targetLabel?: string;
}

export interface ProductCatalog {
  /** route key, mis. "pulsa" */
  key: string;
  title: string;
  desc: string;
  /** label input utama, mis. "Nomor HP" */
  label: string;
  placeholder: string;
  /** apakah produk ini punya tab per kategori */
  tabs: boolean;
  groups: ProductGroup[];
  /** deteksi operator otomatis (hanya pulsa) */
  detectOperator?: boolean;
  /** field form bawaan; tiap group bisa menimpanya */
  fields?: ProductField[];
}

export type PaymentKind = "qris" | "va" | "ewallet" | "retail";

export interface PaymentMethod {
  id: string;
  name: string;
  kind: PaymentKind;
  desc: string;
  /** biaya admin */
  fee: number;
  logo?: string;
  /** prefix nomor virtual account */
  vaPrefix?: string;
  /** false = metode belum aktif (dimatikan sementara) */
  enabled?: boolean;
}

export interface Operator {
  name: string;
  /** awalan nomor */
  prefixes: string[];
  logo?: string;
  /** warna hex fallback bila logo tidak ada */
  color: string;
}

export interface Order {
  id: string;
  svc: string;
  prod: string;
  no: string;
  met: string;
  total: number;
  /** menunggu = belum bayar, diproses = sudah bayar & lagi diproses, sukses = selesai */
  status: "menunggu" | "diproses" | "sukses";
  /** timestamp dibuat */
  t: number;
  /** timestamp dibayar */
  paid?: number;
}
