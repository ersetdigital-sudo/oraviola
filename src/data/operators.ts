import type { Operator } from "@/types";

export const OPERATORS: Operator[] = [
  {
    name: "Telkomsel",
    prefixes: ["0811", "0812", "0813", "0821", "0822", "0823", "0851", "0852", "0853"],
    logo: "/images/operators/telkomsel.png",
    color: "#0A4C8C",
  },
  {
    name: "XL",
    prefixes: ["0817", "0818", "0819", "0859", "0877", "0878"],
    logo: "/images/operators/xl.png",
    color: "#0B5FA5",
  },
  {
    name: "AXIS",
    prefixes: ["0831", "0832", "0833", "0838"],
    logo: "/images/operators/axis.jpg",
    color: "#B3113C",
  },
  {
    name: "IM3 Indosat",
    prefixes: ["0814", "0815", "0816", "0855", "0856", "0857", "0858"],
    logo: "/images/operators/indosat.svg",
    color: "#C8102E",
  },
  {
    name: "Tri (3)",
    prefixes: ["0895", "0896", "0897", "0898", "0899"],
    color: "#111111",
  },
  {
    name: "Smartfren",
    prefixes: ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"],
    logo: "/images/operators/smartfren.svg",
    color: "#E3001B",
  },
];

/** Deteksi operator dari awalan nomor HP. */
export function detectOperator(raw: string): Operator | null {
  let v = raw.replace(/\D/g, "");
  if (v.startsWith("62")) v = "0" + v.slice(2);
  if (v.length < 4) return null;
  const prefix = v.slice(0, 4);
  return OPERATORS.find((o) => o.prefixes.includes(prefix)) ?? null;
}
