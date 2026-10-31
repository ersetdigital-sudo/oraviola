import { redirect } from "next/navigation";

/** Halaman pembayaran lama: status nyata ada di Cek Transaksi. */
export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/cek?id=${encodeURIComponent(id)}`);
}
