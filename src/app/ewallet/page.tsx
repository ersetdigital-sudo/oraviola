import type { Metadata } from "next";
import { ProductPage } from "@/components/product/ProductPage";
import { CATALOGS } from "@/data/products";

const catalog = CATALOGS.ewallet;

export const metadata: Metadata = {
  title: catalog.title,
  description: catalog.desc,
  alternates: { canonical: "/ewallet" },
  openGraph: {
    title: `${catalog.title} | Oraviola`,
    description: catalog.desc,
    url: "/ewallet",
  },
};

export default function EwalletPage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string; nominal?: string }>;
}) {
  return <ProductPage catalogKey="ewallet" searchParams={searchParams} />;
}
