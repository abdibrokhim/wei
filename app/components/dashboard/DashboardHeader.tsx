"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardHeader() {

  return (
    <Card className="bg-card border-0 shadow-md">
      <CardContent className="py-2 px-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src="/wei-icon.png" alt="Wei Icon" />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                WEI
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Wei Habit Tracker</h1>
              <p className="text-muted-foreground">Your AI-powered habit assistant</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 