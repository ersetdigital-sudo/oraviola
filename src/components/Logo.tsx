import Image from "next/image";

type LogoProps = {
  /** lebar render dalam px */
  width?: number;
  className?: string;
  priority?: boolean;
};

/**
 * Logo Oraviola (wordmark transparan, rasio 1212x282).
 * Diletakkan di src/app/fonts & public/images oleh build pipeline.
 */
export function Logo({ width = 160, className, priority = false }: LogoProps) {
  return (
    <Image
      src="/images/orraviola-logo.png"
      alt="Oraviola"
      width={1212}
      height={282}
      priority={priority}
      className={className}
      style={{ width, height: "auto" }}
    />
  );
}
