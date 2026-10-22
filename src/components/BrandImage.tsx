"use client";

import Image from "next/image";

type BrandImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
};

/**
 * Logo merek (payment gateway / operator). SVG dilewati optimizer Next.js
 * agar tidak di proses ulang, PNG/JPG tetap di optimasi.
 */
export function BrandImage({ src, alt, className, sizes = "96px" }: BrandImageProps) {
  const isSvg = src.endsWith(".svg");

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized={isSvg}
      className={className}
    />
  );
}
