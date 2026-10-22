import type { Metadata } from "next";
import { ProductPage } from "@/components/product/ProductPage";
import { CATALOGS } from "@/data/products";

const catalog = CATALOGS.tagihan;

export const metadata: Metadata = {
  title: catalog.title,
  description: catalog.desc,
  alternates: { canonical: "/tagihan" },
  openGraph: {
    title: `${catalog.title} | Oraviola`,
    description: catalog.desc,
    url: "/tagihan",
  },
};

export default function TagihanPage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string; nominal?: string }>;
}) {
  return <ProductPage catalogKey="tagihan" searchParams={searchParams} />;
}
