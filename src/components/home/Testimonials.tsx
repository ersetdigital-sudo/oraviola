import { Reveal } from "@/components/Reveal";
import { TESTIMONIALS } from "@/data/services";

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24">
      <Reveal>
        <h2 className="mb-10 text-4xl font-bold">Kata pelanggan kami</h2>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((item, index) => (
          <Reveal key={item.author} delay={index * 0.08}>
            <figure className="card h-full p-7">
              <blockquote>“{item.quote}”</blockquote>
              <figcaption className="mt-5 text-sm text-mut">{item.author}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
