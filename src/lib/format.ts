/** Format angka ke Rupiah, contoh: 6500 -> "Rp 6.500" */
export function rp(value: number): string {
  return "Rp " + Number(value).toLocaleString("id-ID");
}

/** Format angka tanpa simbol mata uang */
export function num(value: number): string {
  return Number(value).toLocaleString("id-ID");
}

/** Format tanggal Indonesia */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Nomor virtual account bank (dummy, 16 digit) */
export function createVaNumber(prefix: string, target: string): string {
  const digits = target.replace(/\D/g, "").padStart(11, "0");
  return (prefix + digits).slice(0, 16);
}

/** Format nomor VA dengan spasi per 4 digit */
export function formatVaNumber(value: string): string {
  return value.replace(/(.{4})/g, "$1 ").trim();
}
