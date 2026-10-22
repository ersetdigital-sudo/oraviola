import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ACTIVE_BILLS, STATS } from "@/data/site";

export function Hero() {
  return (
    <section className="glow relative overflow-hidden">
      <div className="grid-bg absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pt-20 pb-24 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="mb-5 text-sm text-mint">
              <span className="mr-1">●</span> Sistem online 24 jam · rata-rata 3 detik
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="text-5xl leading-[1.02] font-extrabold md:text-7xl">
              Semua tagihan,
              <br />
              <span className="text-lime">satu tarikan napas.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-lg text-mut">
              Pulsa, paket data, token PLN, e-wallet, top up game, sampai BPJS &amp; PDAM. Harga
              jujur, tanpa daftar, langsung masuk.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/#isi"
                className="rounded-full bg-lime px-7 py-4 font-bold text-bg transition hover:brightness-95"
              >
                Isi ulang sekarang
              </Link>
              <Link
                href="/#layanan"
                className="rounded-full border border-white/15 px-7 py-4 font-bold transition hover:border-white/40"
              >
                Lihat layanan
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <dl className="mt-12 flex gap-10">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="hd text-3xl font-bold">{stat.value}</dd>
                  <dd className="text-sm text-mut">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.15} y={40}>
          <div className="relative">
            <div className="card mx-auto max-w-sm p-6 shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-mut">Tagihan bulan ini</span>
                <span className="rounded-full bg-mint/12 px-2.5 py-1 text-xs font-bold text-mint">
                  {ACTIVE_BILLS.length} menunggu
                </span>
              </div>
              <p className="hd mt-2 text-4xl font-bold">
                Rp{ACTIVE_BILLS.reduce((sum, bill) => sum + bill.amount, 0).toLocaleString("id-ID")}
              </p>

              <ul className="mt-6 space-y-3">
                {ACTIVE_BILLS.map((bill) => (
                  <li key={bill.name} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 p-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{bill.name}</p>
                      <p className="text-xs text-mut">{bill.meta}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-bold">Rp{bill.amount.toLocaleString("id-ID")}</p>
                      <p className="text-xs text-mint">Belum dibayar</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-sm text-mut">Total tagihan</span>
                <span className="hd text-xl font-bold text-lime">
                  Rp{ACTIVE_BILLS.reduce((sum, bill) => sum + bill.amount, 0).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="card absolute -bottom-6 -left-2 px-4 py-3 text-sm md:left-6">
              <span className="text-mint">Cashback</span> +Rp10.000
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
