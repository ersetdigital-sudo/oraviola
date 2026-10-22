import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SITE } from "@/data/site";

const FOOTER_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Layanan", href: "/#layanan" },
  { label: "Promo", href: "/#promo" },
  { label: "Bantuan", href: "/#faq" },
  { label: "Cek Transaksi", href: "/cek" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto max-w-6xl px-5 py-16 pb-32 lg:pb-16">
        <Logo width={230} className="h-auto" />

        <div className="mt-8 flex flex-col justify-between gap-4 text-sm text-mut md:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. Bayar &amp; isi ulang digital.</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Navigasi footer">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
