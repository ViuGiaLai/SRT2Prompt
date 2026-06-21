import { BrandIcon } from "@/components/BrandIcon";

type PageLoaderProps = {
  label?: string;
  compact?: boolean;
};

export function PageLoader({ label = "Loading", compact = false }: PageLoaderProps) {
  return (
    <div className={`flex min-h-[60vh] items-center justify-center px-4 ${compact ? "py-10" : "py-16"}`}>
      <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-panel px-6 py-8 text-center shadow-sm">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-2 border-accent/20" />
          <span className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin motion-reduce:animate-none" />
          <BrandIcon size={26} className="relative z-10" />
        </div>
        <div>
          <div className="text-base font-medium text-fg">{label}</div>
          <div className="mt-1 text-sm text-muted">Please wait a moment.</div>
        </div>
      </div>
    </div>
  );
}
