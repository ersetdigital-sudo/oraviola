# Oraviola

Bayar & isi ulang digital — pulsa, paket data, token PLN, e-wallet, top up game, BPJS & PDAM.
Dikonversi dari HTML statis ke **Next.js (App Router) + TypeScript + Tailwind CSS v4**.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve hasil build
npm run typecheck
```

## Struktur

```
public/
  images/
    orraviola-logo.png        wordmark transparan
    operators/                logo operator (Telkomsel, XL, AXIS, IM3, Smartfren)
    payments/                 logo payment gateway & gerai retail
src/
  app/
    layout.tsx                fonts, metadata global, JSON-LD Organization + WebSite
    page.tsx                  beranda + JSON-LD FAQPage
    globals.css               design tokens (Tailwind v4 @theme)
    fonts/                    DM Sans + Bricolage Grotesque (.ttf lokal)
    pulsa|pln|ewallet|game|tagihan/page.tsx
    bpjs/page.tsx, pdam/page.tsx  (tagihan dipisah per layanan)
    cek/page.tsx              lacak transaksi dari Supabase
    pay/[id]/page.tsx         redirect ke Cek Transaksi
    api/orders/[invoice]/     status pesanan publik (server)
    admin/                    dashboard admin per brand
    opengraph-image.tsx       OG image 1200x630 (dibuat runtime)
    sitemap.ts, robots.ts, icon.png
  components/
    Header.tsx, Footer.tsx, Logo.tsx, Icons.tsx, Reveal.tsx, BrandImage.tsx
    home/                     Hero, Marquee, ServiceGrid, Steps, QuickTopup, Promo,
                              Testimonials, Faq
    product/                  ProductPage (server) + ProductView (client)
    payment/                  PaymentModal (3 langkah) + QrCode
    cek/                      TransactionChecker
  data/
    site.ts, services.ts, products.ts, payments.ts, operators.ts
  lib/
    format.ts                 format Rupiah, tanggal, nomor VA
    catalog-hydrate.ts        gabungkan katalog statis dengan harga DB
    db/                       client/server Supabase + mapper RPC
  modules/admin/              komponen, aksi, dan style dashboard admin
  types/index.ts
legacy/                       HTML & asset asli (arsip, tidak dipakai build)
```

## Form katalog game

Tiap game punya form ID sendiri, ditentukan di `src/data/products.ts` lewat
`groups[].fields` (lihat `ProductField` di `src/types/index.ts`):

| Game | Field yang diminta |
| --- | --- |
| Mobile Legends | User ID + Zone ID → `12345678 (1234)` |
| Free Fire | Player ID |
| PUBG Mobile | Character ID (angka profil) |
| Genshin Impact | UID + Server (Asia/Europe/America/TW/HK/MO/SAR) |
| Honkai: Star Rail | UID + Server |
| Valorant | Riot ID (`Nama#TAG`) |
| Call of Duty Mobile | Player ID |
| Roblox | Username Roblox |
| Honor of Kings | Player ID (UID) |
| Arena of Valor | Open ID |
| Point Blank | Zepetto ID |
| Steam Wallet | tanpa input — kode voucher dikirim otomatis |

`ProductView` merender field sesuai tab game yang aktif. Katalog lain (pulsa,
PLN, e-wallet, dsb) tetap memakai satu input biasa.

## Routing

| Route | Isi |
| --- | --- |
| `/` | Beranda: hero, marquee, filter layanan, widget isi ulang cepat, promo, testimoni, FAQ |
| `/pulsa` | Pulsa & paket data (deteksi operator otomatis) |
| `/pln` | Token listrik & tagihan pascabayar PLN |
| `/ewallet` | 9 e-wallet (DANA, OVO, GoPay, ShopeePay, LinkAja, i.saku, Sakuku, AstraPay, Doku) |
| `/game` | 12 game (Mobile Legends, Free Fire, PUBG, Genshin, dll) |
| `/bpjs` | Iuran BPJS Kesehatan |
| `/pdam` | Tagihan air PDAM |
| `/tagihan` | Internet rumah & TV kabel |
| `/cek` | Cek status transaksi langsung dari Supabase |
| `/pay/[id]` | Redirect ke `/cek?id=...` |

## Alur pembayaran

1. Pilih produk → isi nomor tujuan (operator terdeteksi otomatis pada pulsa).
2. `PaymentModal` menampilkan metode pembayaran yang aktif di database brand. Saat ini
   **hanya QRIS** yang aktif; metode lain belum di-seed.
3. Memilih metode akan membuat order di Supabase lewat `create_order`, lalu modal menampilkan
   invoice `OVL-...`, total final, dan QRIS brand dari database.
4. Kode promo divalidasi lewat `cek_voucher` (contoh `ORAVIOLA10` untuk token PLN).
5. Tombol **"Saya sudah bayar"** menandai pesanan sedang diperiksa. Modal memantau status
   Supabase; setelah admin menandai sukses dan mengisi SN, modal menampilkan
   "Transaksi berhasil!" beserta SN/token.
6. Status bisa dicek kapan saja di `/cek?id=<invoice>`; data diambil dari server, bukan
   localStorage. Status: `menunggu`, `diproses`, `sukses`, `dibatalkan`.

## Yang masih perlu diisi manual

| Letak | Isian |
| --- | --- |
| Environment | Isi `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `BRAND_SLUG=oraviola`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP`. Lihat `.env.example`. |
| Admin | Login di `/admin` dengan akun yang dibuat saat seed (password ada di `.env.admin.local`, tidak di-commit). |
| `src/data/payments.ts` → `QRIS_IMAGE` | Hanya fallback bila brand belum punya gambar QRIS di database. |
| `src/data/products.ts` | Daftar produk & urutan tetap; harga jual diambil dari database saat halaman dirender. Ubah harga lewat `/admin/produk`. |

## Catatan

- Font (DM Sans + Bricolage Grotesque) dilokalisasi via `next/font/local` dari `src/app/fonts`,
  sehingga tidak ada request ke Google Fonts.
- Semua gambar pakai `next/image` dengan `AVIF/WebP` dan dimensi eksplisit (anti CLS).
- Animasi memakai `motion` (Framer Motion) dan aman untuk `prefers-reduced-motion`.
