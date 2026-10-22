import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return <section className="page-stack" aria-busy="true" aria-label="Memuat halaman"><p role="status" className="sr-only">Memuat halaman…</p><Skeleton className="h-9 w-48" /><Skeleton className="h-5 w-3/4 max-w-md" /><div className="grid gap-4 lg:grid-cols-2">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-36 rounded-xl" />)}</div></section>;
}
