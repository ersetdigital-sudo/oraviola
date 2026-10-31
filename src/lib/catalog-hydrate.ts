import { CATALOGS } from "@/data/products";
import { SERVICES } from "@/data/services";
import { getCatalog, type CatalogMethod, type CatalogService } from "@/lib/db/server";
import type { WebBrand } from "@/lib/db/types";
import { num } from "@/lib/format";
import type { ProductCatalog, Service } from "@/types";

const SERVICE_CATALOG_KEY: Record<string, string> = {
  pulsa: "pulsa",
  "paket-data": "pulsa",
  ewallet: "ewallet",
  game: "game",
  "token-pln": "pln",
  "tagihan-pln": "pln",
  bpjs: "bpjs",
  pdam: "pdam",
  "internet-tv": "tagihan",
};

function hydrateCatalog(
  catalog: ProductCatalog,
  dbService: CatalogService | undefined,
): ProductCatalog {
  if (!dbService) return catalog;

  let index = 0;
  const groups = catalog.groups.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      const dbProduct =
        dbService.products[index] ??
        dbService.products.find((product) => product.nama === item.name);
      index += 1;
      return dbProduct
        ? { ...item, price: dbProduct.hargaJual, dbId: dbProduct.id }
        : item;
    }),
  }));

  return { ...catalog, dbServiceId: dbService.dbId, groups };
}

export type Storefront = {
  catalogs: Record<string, ProductCatalog>;
  methods: CatalogMethod[];
  brand: WebBrand | null;
};

export async function getStorefront(): Promise<Storefront> {
  const result = await getCatalog();
  const data = result.data;
  if (!data) {
    return { catalogs: CATALOGS, methods: [], brand: null };
  }

  const bySlug = new Map(data.services.map((service) => [service.slug, service]));
  const catalogs = Object.fromEntries(
    Object.keys(CATALOGS).map((key) => [
      key,
      hydrateCatalog(CATALOGS[key], bySlug.get(key)),
    ]),
  );

  return { catalogs, methods: data.methods, brand: data.brand };
}

export async function getHydratedCatalog(key: string) {
  const storefront = await getStorefront();
  return {
    catalog: storefront.catalogs[key] ?? null,
    methods: storefront.methods,
    brand: storefront.brand,
  };
}

function minPrice(catalog: ProductCatalog | undefined) {
  if (!catalog) return null;
  const prices = catalog.groups
    .flatMap((group) => group.items.map((item) => item.price))
    .filter((price) => Number.isFinite(price) && price > 0);
  return prices.length ? Math.min(...prices) : null;
}

export async function getHydratedServices(): Promise<Service[]> {
  const storefront = await getStorefront();
  if (!storefront.brand) return SERVICES;

  return SERVICES.map((service) => {
    const key = SERVICE_CATALOG_KEY[service.slug];
    const min = key ? minPrice(storefront.catalogs[key]) : null;
    if (min === null) return service;
    return {
      ...service,
      description: service.description.replace(
        /(mulai\s+rp\s+)[\d.]+/i,
        (_match, prefix: string) => `${prefix}${num(min)}`,
      ),
    };
  });
}
