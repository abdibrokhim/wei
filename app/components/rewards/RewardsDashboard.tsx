"use client";

import { useState, useEffect } from "react";
import { useDatabase } from "@/app/contexts/DatabaseContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import RewardsList from "./RewardsList";
import NewRewardDialog from "./NewRewardDialog";

export default function RewardsDashboard() {
  const { getRewards } = useDatabase();
  const [rewards, setRewards] = useState<any[]>([]);
  const [isNewRewardDialogOpen, setIsNewRewardDialogOpen] = useState(false);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    const userRewards = await getRewards();
    setRewards(userRewards);
  };

  const handleNewReward = async (newReward: any) => {
    await loadRewards();
    toast.success("New reward added successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Rewards</h2>
        <Button onClick={() => setIsNewRewardDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Reward
        </Button>
      </div>

      {rewards.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">You don't have any rewards yet.</p>
            <Button 
              variant="link" 
              onClick={() => setIsNewRewardDialogOpen(true)}
              className="mt-2"
            >
              Add your first reward
            </Button>
          </CardContent>
        </Card>
      ) : (
        <RewardsList rewards={rewards} onRewardsChanged={loadRewards} />
      )}

      <NewRewardDialog 
        open={isNewRewardDialogOpen} 
        onOpenChange={setIsNewRewardDialogOpen}
        onRewardCreated={handleNewReward} 
      />
    </div>
  );
} 