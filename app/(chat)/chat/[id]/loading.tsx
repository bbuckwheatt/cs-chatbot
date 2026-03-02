import { ChatSkeleton } from "@/components/chat-skeleton";

// File-based loading convention for the [id] chat route.
// Next.js automatically wraps this in a Suspense boundary during navigation,
// showing ChatSkeleton instantly while the async page component fetches data.
export default function Loading() {
  return <ChatSkeleton />;
}
