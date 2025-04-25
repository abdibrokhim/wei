"use client";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStats from "../components/dashboard/DashboardStats";
import BottomNavigation from "../components/dashboard/BottomNavigation";
import DatabaseError from "../components/errors/DatabaseError";
import { useDatabase } from "../contexts/DatabaseContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { error, isLoading } = useDatabase();

  if (error) {
    return <DatabaseError error={error} onRetry={() => window.location.reload()} />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
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
      <div className="container mx-auto p-2 space-y-6 pb-20 md:pb-6">
        <DashboardHeader />
        <DashboardStats />
      </div>
      <BottomNavigation />
    </>
  );
} 