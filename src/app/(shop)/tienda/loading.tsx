import { Skeleton } from "@/components/ui/skeleton";

export default function TiendaLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-2 h-4 w-32" />

      <div className="mt-8 flex gap-10">
        <aside className="hidden w-56 shrink-0 flex-col gap-4 lg:flex">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </aside>

        <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
