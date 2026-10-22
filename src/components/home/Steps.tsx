import { Reveal } from "@/components/Reveal";
import { QuickTopup } from "@/components/home/QuickTopup";
import { STEPS } from "@/data/services";

export function Steps() {
  return (
    <section id="isi" className="mx-auto grid max-w-6xl scroll-mt-20 items-start gap-12 px-5 pb-24 lg:grid-cols-2">
      <div>
        <Reveal>
          <h2 className="text-4xl font-bold md:text-5xl">Tiga langkah, selesai.</h2>
        </Reveal>

        <ol className="mt-10 space-y-8">
          {STEPS.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.08}>
              <li className="flex gap-5">
                <span className="hd text-2xl font-bold text-lime">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-lg font-bold">{step.title}</p>
                  <p className="text-mut">{step.desc}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>

      <Reveal delay={0.1}>
        <QuickTopup />
      </Reveal>
    </section>
  );
}
