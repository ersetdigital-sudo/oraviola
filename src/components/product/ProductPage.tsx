import { notFound } from "next/navigation";
import { ProductView } from "@/components/product/ProductView";
import { getHydratedCatalog } from "@/lib/catalog-hydrate";
import { SITE } from "@/data/site";

type SearchParams = { no?: string; nominal?: string };

export type ProductPageProps = {
  catalogKey: string;
  searchParams: Promise<SearchParams>;
};

/** Halaman produk generik (pulsa, pln, ewallet, game, tagihan). */
export async function ProductPage({ catalogKey, searchParams }: ProductPageProps) {
  const { catalog, methods, brand } = await getHydratedCatalog(catalogKey);
  if (!catalog) notFound();

  const params = await searchParams;

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: catalog.title,
    description: catalog.desc,
    serviceType: catalog.title,
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
    areaServed: { "@type": "Country", name: "Indonesia" },
    offers: catalog.groups.map((group) => ({
      "@type": "Offer",
      priceCurrency: "IDR",
      price: group.items[0]?.price ?? 0,
      availability: "https://schema.org/InStock",
      itemOffered: {
        "@type": "Service",
        name: group.name,
        description: group.items.map((item) => item.name).join(", "),
      },
    })),
  };

  return (
    <>
      <ProductView
        catalog={catalog}
        methods={methods}
        brandSlug={brand?.slug ?? ""}
        qrisImageUrl={brand?.qris_image_url ?? null}
        initialNumber={params.no ?? ""}
        initialNominal={params.nominal}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
    </>
  );
}
