"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal } from "@/components/Reveal";
import { FAQS } from "@/data/services";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 pb-24">
      <Reveal>
        <h2 className="mb-8 text-center text-4xl font-bold">Pertanyaan umum</h2>
      </Reveal>

      <div className="border-t border-white/10">
        {FAQS.map((item, index) => {
          const expanded = open === index;
          return (
            <Reveal key={item.q} delay={index * 0.05}>
              <div className="border-b border-white/10">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : index)}
                    aria-expanded={expanded}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left font-bold"
                  >
                    {item.q}
                    <motion.span
                      aria-hidden="true"
                      animate={{ rotate: expanded ? 45 : 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="text-xl font-normal text-lime"
                    >
                      +
                    </motion.span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-mut">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
