import clsx from "clsx";

export default function Skeleton({ className }) {
  return <div className={clsx("animate-pulse rounded-lg bg-slate-200/70", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
    </div>
  );
}
