import { getOrderByRef, getPaymentByRef } from "@/lib/db/server";

function mapStatus(status: string) {
  if (status === "sukses") return "sukses";
  if (status === "sudah_bayar") return "diproses";
  if (status === "dibatalkan") return "gagal";
  return "menunggu";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ invoice: string }> },
) {
  const { invoice } = await context.params;
  const [payment, orders] = await Promise.all([
    getPaymentByRef(invoice),
    getOrderByRef(invoice),
  ]);

  if (!payment.data) {
    return Response.json(
      { message: payment.error || "Pesanan tidak ditemukan" },
      { status: 404 },
    );
  }

  const data = payment.data;
  const detail = orders.data?.[0] ?? null;
  return Response.json({
    id: data.ref,
    svc: data.nama_layanan,
    prod: data.nama_produk ?? "-",
    no: data.nomor_tujuan,
    met: data.metode_bayar ?? "QRIS",
    total: data.total ?? 0,
    t: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
    status: mapStatus(data.status),
    sn: detail?.sn ?? null,
    paidAt: detail?.paid_at ? new Date(detail.paid_at).getTime() : null,
    completedAt: detail?.completed_at ? new Date(detail.completed_at).getTime() : null,
  });
}
