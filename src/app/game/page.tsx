import type { Metadata } from "next";
import { ProductPage } from "@/components/product/ProductPage";
import { CATALOGS } from "@/data/products";

const catalog = CATALOGS.game;

export const metadata: Metadata = {
  title: catalog.title,
  description: catalog.desc,
  alternates: { canonical: "/game" },
  openGraph: {
    title: `${catalog.title} | Oraviola`,
    description: catalog.desc,
    url: "/game",
  },
};

export default function GamePage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string; nominal?: string }>;
}) {
  return <ProductPage catalogKey="game" searchParams={searchParams} />;
}
