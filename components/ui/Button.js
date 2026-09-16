import Link from "next/link";
import clsx from "clsx";

const variants = {
  primary:
    "bg-gradient-to-b from-brand-light to-brand text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_8px_20px_-8px_rgba(249,115,22,0.55)] hover:brightness-110 active:brightness-95",
  accent:
    "bg-gradient-to-b from-accent-light to-accent-dark text-white shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_8px_20px_-8px_rgba(21,128,61,0.55)] hover:brightness-105 active:brightness-95",
  outline: "border border-slate-200 bg-white text-slate-700 hover:border-brand/40 hover:bg-brand/5 hover:text-brand",
  ghost: "text-slate-700 hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  as,
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...props
}) {
  const classes = clsx(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  const Comp = as || "button";
  return (
    <Comp className={classes} disabled={disabled} {...props}>
      {children}
    </Comp>
  );
}
