import type { Metadata } from "next";
import { ProductPage } from "@/components/product/ProductPage";
import { CATALOGS } from "@/data/products";

const catalog = CATALOGS.bpjs;

export const metadata: Metadata = {
  title: catalog.title,
  description: catalog.desc,
  alternates: { canonical: "/bpjs" },
  openGraph: {
    title: `${catalog.title} | Oraviola`,
    description: catalog.desc,
    url: "/bpjs",
  },
};

export default function BpjsPage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string; nominal?: string }>;
}) {
  return <ProductPage catalogKey="bpjs" searchParams={searchParams} />;
}
