import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function AdminLoading() {
  return (
    <div className="min-h-[100dvh] bg-[oklch(0.985_0.006_85)] px-4 py-12 md:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="flex flex-col gap-4 border-b border-foreground/10 pb-10 md:flex-row md:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <Skeleton className="h-11 w-36 shrink-0 rounded-xl" />
        </div>
        <Card className="rounded-2xl border-foreground/10 p-8">
          <Skeleton className="mb-6 h-6 w-40" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <Skeleton className="mt-6 h-24 w-full rounded-xl" />
        </Card>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
