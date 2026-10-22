import type { Metadata } from "next";
import { ProductPage } from "@/components/product/ProductPage";
import { CATALOGS } from "@/data/products";

const catalog = CATALOGS.pln;

export const metadata: Metadata = {
  title: catalog.title,
  description: catalog.desc,
  alternates: { canonical: "/pln" },
  openGraph: {
    title: `${catalog.title} | Oraviola`,
    description: catalog.desc,
    url: "/pln",
  },
};

export default function PlnPage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string; nominal?: string }>;
}) {
  return <ProductPage catalogKey="pln" searchParams={searchParams} />;
}
