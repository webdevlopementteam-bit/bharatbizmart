import { Star } from "lucide-react";
import clsx from "clsx";

export default function Rating({ value = 0, count, size = "sm", showCount = true }) {
  const dims = size === "sm" ? "h-3.5 w-3.5" : size === "md" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={clsx(dims, i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")}
          />
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-slate-500">
          {value ? value.toFixed(1) : "New"} {count ? `(${count})` : ""}
        </span>
      )}
    </div>
  );
}
