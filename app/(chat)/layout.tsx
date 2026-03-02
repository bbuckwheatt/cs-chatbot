import { cookies } from "next/headers";
import Script from "next/script";
import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ChatSkeleton } from "@/components/chat-skeleton";
import { DataStreamProvider } from "@/components/data-stream-provider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { auth } from "../(auth)/auth";

// Layout stays synchronous — it is the static shell in Next.js 16's
// Cache Components model. Dynamic data (cookies, auth) must only be
// accessed inside Suspense boundaries, never in the static shell.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <DataStreamProvider>
        <Suspense fallback={<ChatSkeleton />}>
          <SidebarShell>{children}</SidebarShell>
        </Suspense>
      </DataStreamProvider>
    </>
  );
}

// Reads ONLY cookies — resolves in microseconds (request headers, no I/O).
// This is the first async boundary: it establishes the correct sidebar
// open/closed state before anything visible renders. The outer ChatSkeleton
// is shown for such a brief moment it never reaches a browser paint.
async function SidebarShell({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isCollapsed = cookieStore.get("sidebar_state")?.value !== "true";

  return (
    <SidebarProvider defaultOpen={!isCollapsed}>
      {/* Second async boundary: auth resolves separately so it only
          blocks the sidebar content, not the sidebar structure or page. */}
      <Suspense fallback={<AppSidebarSkeleton />}>
        <AuthedAppSidebar />
      </Suspense>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

// Reads auth separately — slower than cookies (session DB lookup).
// Isolated behind its own Suspense so auth latency only affects
// the sidebar content (history, user nav), not the page content.
async function AuthedAppSidebar() {
  const session = await auth();
  return <AppSidebar user={session?.user} />;
}

// Shown inside the correct sidebar panel width while auth resolves.
// Uses Sidebar/SidebarContent so it inherits the panel structure and
// collapsed state from SidebarProvider context.
function AppSidebarSkeleton() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Skeleton className="h-8 w-32" />
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col gap-2 p-2">
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
            <Skeleton key={i} className="h-7 w-full rounded-md" />
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
