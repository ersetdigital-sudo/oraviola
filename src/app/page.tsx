import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Promo } from "@/components/home/Promo";
import { ServiceGrid } from "@/components/home/ServiceGrid";
import { Steps } from "@/components/home/Steps";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQS } from "@/data/services";
import { SITE } from "@/data/site";
import { getHydratedServices } from "@/lib/catalog-hydrate";

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default async function HomePage() {
  const services = await getHydratedServices();

  return (
    <>
      <Hero />
      <Marquee />
      <ServiceGrid services={services} />
      <Steps />
      <Promo />
      <Testimonials />
      <Faq />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </>
  );
}
