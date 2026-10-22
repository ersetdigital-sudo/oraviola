"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "@/components/Logo";
import { NAV_LINKS } from "@/data/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";

  return (
    <header
      className={`sticky top-0 z-50 border-b border-white/5 bg-bg/80 backdrop-blur-xl transition-colors ${
        scrolled ? "bg-bg/95" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="shrink-0" aria-label="Oraviola beranda">
          <Logo width={150} priority className="h-auto" />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-mut md:flex" aria-label="Navigasi utama">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.href === "/" && isHome
                  ? "text-txt transition hover:text-white"
                  : "transition hover:text-white"
              }
            >
              {link.label}
            </Link>
          ))}
          <Link href="/cek" className="font-bold text-lime transition hover:text-white">
            Cek Transaksi
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/#isi"
            className="hidden rounded-full bg-lime px-5 py-2 text-sm font-bold text-bg transition hover:brightness-95 sm:block"
          >
            Mulai
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-txt transition hover:border-lime/40 md:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 block h-0.5 w-4 rounded bg-current transition-all ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 block h-0.5 w-4 rounded bg-current transition-all ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-4 rounded bg-current transition-all ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            key="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-white/5 bg-bg/95 backdrop-blur-xl md:hidden"
            aria-label="Navigasi mobile"
          >
            <div className="mx-auto flex max-w-6xl flex-col px-5 py-4 text-sm">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="py-3 text-mut transition hover:text-white">
                  {link.label}
                </Link>
              ))}
              <Link href="/cek" className="py-3 font-bold text-lime">
                Cek Transaksi
              </Link>
              <Link
                href="/#isi"
                className="mt-3 rounded-full bg-lime px-5 py-3 text-center font-bold text-bg"
              >
                Mulai
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
