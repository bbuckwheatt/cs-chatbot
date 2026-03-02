import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex h-dvh w-full">
      {/* Sidebar placeholder — only render when sidebar is expanded,
          matching the offcanvas sidebar's spacer width of 0 when collapsed */}
      {!collapsed && (
        <div className="hidden w-64 shrink-0 flex-col gap-3 border-r p-4 md:flex">
          <Skeleton className="h-8 w-32" />
          <div className="mt-4 flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
              <Skeleton key={i} className="h-7 w-full rounded-md" />
            ))}
          </div>
        </div>
      )}

      {/* Chat area placeholder */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex h-14 items-center border-b px-4">
          <Skeleton className="h-6 w-24" />
        </div>

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-6 overflow-hidden p-6">
          <div className="flex gap-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex flex-row-reverse gap-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-60" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="border-t p-4">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
