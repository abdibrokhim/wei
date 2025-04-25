"use client";

import { useDatabase } from "@/app/contexts/DatabaseContext";
import { Skeleton } from "@/components/ui/skeleton";
import DatabaseError from "@/app/components/errors/DatabaseError";
import ChatInterface from "@/app/components/chat/ChatInterface";
import BottomNavigation from "@/app/components/dashboard/BottomNavigation";

export default function ChatPage() {
  const { error, isLoading } = useDatabase();

  if (error) {
    return <DatabaseError error={error} onRetry={() => window.location.reload()} />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-2 space-y-6 pb-20">
        <ChatInterface />
      </div>
      <BottomNavigation />
    </>
  );
} 