import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Oraviola — Bayar & Isi Ulang Digital, Tenang dan Cepat";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const dir = path.join(process.cwd(), "src", "app", "fonts");

  const [display, body] = await Promise.all([
    readFile(path.join(dir, "bricolagegrotesque-opsz-wdth-wght--extrabold.ttf")),
    readFile(path.join(dir, "dmsans-regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background:
            "radial-gradient(700px 420px at 78% 12%, rgba(91,227,176,0.22), transparent 70%), #07130F",
          color: "#E9F3EE",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "#D6FF63",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#07130F",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            O
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, color: "#D6FF63" }}>Oraviola</div>
        </div>

        <div
          style={{
            marginTop: 48,
            fontSize: 76,
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Semua tagihan,</span>
          <span style={{ color: "#D6FF63" }}>satu tarikan napas.</span>
        </div>

        <div style={{ marginTop: 36, fontSize: 30, color: "#8FA59C" }}>
          Pulsa · Paket Data · Token PLN · E-Wallet · Game · BPJS · PDAM
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage", data: display, weight: 800, style: "normal" },
        { name: "DM Sans", data: body, weight: 400, style: "normal" },
      ],
    },
  );
}
