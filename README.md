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
    cek/page.tsx              lacak transaksi (riwayat di localStorage)
    pay/[id]/page.tsx         target QRIS / link pembayaran
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
    orders.ts                 simpan/baca pesanan di localStorage
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
| `/cek` | Cek status transaksi + riwayat perangkat |
| `/pay/[id]` | Halaman tujuan QRIS |

## Alur pembayaran

1. Pilih produk → isi nomor tujuan (operator terdeteksi otomatis pada pulsa).
2. `PaymentModal` menampilkan metode: **QRIS**, **Virtual Account** (BCA/BRI/BNI/Mandiri),
   **E-Wallet** (DANA/OVO/GoPay/ShopeePay), dan **Gerai Retail** (Alfamart/Indomaret).
   Saat ini **hanya QRIS yang aktif** — sisanya tampil redup dengan label "Segera hadir" /
   "Nonaktif" dan tidak bisa diklik. Aktifkan dengan mengubah `enabled: false` → `true`
   di `src/data/payments.ts`.
3. QRIS memakai **QR Code Standar (static)** milik merchant:
   `https://res.cloudinary.com/dqjh7utdb/image/upload/v1792161327/camhvfeu1lcm0ps8ieiz.jpg`
   (di-load lewat `next/image`, host-nya didaftarkan di `images.remotePatterns`).
4. Tombol **"Saya sudah bayar"** → verifikasi singkat ("Memverifikasi…") → layar
   **"Terima kasih! Pembayaranmu telah diterima dan akan segera diproses"**
   (spinner, status pesanan = `diproses`) → setelah jeda otomatis jadi
   "Transaksi berhasil!" (status = `sukses`).
5. Status tersimpan di `localStorage` (`orraviola_orders`) sehingga bisa dilacak di `/cek`.
   Tiga status: `menunggu` (belum bayar), `diproses` (sudah bayar, lagi diproses),
   `sukses` (selesai).

## Yang masih perlu diisi manual

| Letak | Isian |
| --- | --- |
| `src/data/site.ts` → `SITE.url` | URL produksi (default `https://orraviola.id`). Isi `NEXT_PUBLIC_SITE_URL` saat deploy. |
| `src/data/site.ts` → `SITE.waNumber`, `SITE.email`, `SITE.address` | Belum ada di HTML asli — dipakai untuk data structured data. |
| `src/data/payments.ts` → `QRIS_IMAGE` | URL QRIS static di Cloudinary — ganti kalo merchant code-nya diganti. |
| `src/data/payments.ts` → `enabled` | Yang `false` = metode nonaktif. Saat ini cuma QRIS yang nyala. |
| `src/app/pay/[id]/page.tsx` | Halaman detail pembayaran (belum dipakai QRIS static). |
| `src/lib/orders.ts` | Penyimpanan masih di `localStorage`. Untuk produksi, ganti ke API/database. |
| `src/data/products.ts` | Harga masih dummy — ganti dengan harga dari provider. |

## Catatan

- Font (DM Sans + Bricolage Grotesque) dilokalisasi via `next/font/local` dari `src/app/fonts`,
  sehingga tidak ada request ke Google Fonts.
- Semua gambar pakai `next/image` dengan `AVIF/WebP` dan dimensi eksplisit (anti CLS).
- Animasi memakai `motion` (Framer Motion) dan aman untuk `prefers-reduced-motion`.
