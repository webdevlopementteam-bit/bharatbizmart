import Image from "next/image";
import Link from "next/link";

const heights = { sm: "h-7", md: "h-9", lg: "h-14" };

/**
 * The actual BharatBizMart wordmark (public/logo.jpeg) — a single flattened
 * image with the "B" mark, "BharatBizMart" text and the "Empowering
 * Businesses" tagline already baked in, on a white background. Only use it
 * on light/white surfaces (header, footer, auth pages) — the baked-in white
 * background would show as a visible box on dark surfaces like the
 * dashboard/admin sidebars, which keep their own flat-color badge instead.
 */
export default function Logo({ size = "md", href = "/", className = "" }) {
  return (
    <Link href={href} className={`inline-flex shrink-0 items-center ${className}`}>
      <Image
        src="/logo.jpeg"
        alt="BharatBizMart — Empowering Businesses"
        width={1128}
        height={191}
        priority
        className={`w-auto ${heights[size]}`}
      />
    </Link>
  );
}
