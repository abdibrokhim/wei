"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useDatabase } from "@/app/contexts/DatabaseContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Award, 
  Flame, 
  Calendar, 
  BarChart, 
  User,
  Mail,
  Edit,
  Sparkles,
  TrendingUp,
  Clock
} from "lucide-react";

interface Activity {
  id: number;
  action: string;
  target: string;
  date: string;
  points: number;
}

export default function ProfileDashboard() {
  const { userPoints, getCompletions, getHabits } = useDatabase();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editableUserData, setEditableUserData] = useState({
    name: "Jane Doe",
    email: "jane@example.com",
  });
  const [streak, setStreak] = useState(0);
  const [completionRate, setCompletionRate] = useState("0%");
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  
  // Mock achievements for now - in a real app, these would come from the database
  const achievements = [
    { id: 1, name: "First Step", description: "Complete your first habit", icon: "🌱", earned: true },
    { id: 2, name: "Week Warrior", description: "7 day streak", icon: "🔥", earned: true },
    { id: 3, name: "Early Bird", description: "Complete a habit before 8am", icon: "🌅", earned: false },
    { id: 4, name: "Night Owl", description: "Complete a habit after 10pm", icon: "🌙", earned: false }
  ];
  
  // Load user stats
  useEffect(() => {
    const loadUserStats = async () => {
      try {
        // Get user's habit completions for the past week
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        
        // The getCompletions function expects dates
        const recentCompletions = await getCompletions(undefined, today);
        const allHabits = await getHabits();
        
        // Calculate streak (simplified logic - in a real app this would be more complex)
        // For this example, we'll just use a random value between 1-30 days
        setStreak(Math.floor(Math.random() * 30) + 1);
        
        // Calculate completion rate
        const totalPossibleCompletions = allHabits.length * 7; // all habits over 7 days
        const actualCompletions = recentCompletions.length;
        const rate = totalPossibleCompletions > 0 
          ? Math.round((actualCompletions / totalPossibleCompletions) * 100) 
          : 0;
        setCompletionRate(`${rate}%`);
        
        // Get recent activities
        const recent: Activity[] = recentCompletions.slice(0, 5).map((completion, index) => {
          const habit = allHabits.find(h => h.id === completion.habitId);
          return {
            id: index + 1,
            action: "Completed",
            target: habit ? habit.name : "Unknown habit",
            date: new Date(completion.completedAt).toLocaleDateString(),
            points: habit ? habit.points : 10
          };
        });
        
        // Add a mock reward redemption
        if (recent.length > 0) {
          recent.splice(1, 0, {
            id: recent.length + 1,
            action: "Redeemed",
            target: "Coffee Break",
            date: new Date().toLocaleDateString(),
            points: -50
          });
        }
        
        setRecentActivities(recent);
      } catch (error) {
        console.error("Failed to load user stats:", error);
      }
    };
    
    loadUserStats();
  }, [getCompletions, getHabits]);
  
  const handleEditProfile = () => {
    setIsEditDialogOpen(true);
  };
  
  const handleSaveProfile = () => {
    // In a real app, you would save this to the database
    setIsEditDialogOpen(false);
    toast.success("Profile updated successfully!");
  };
  
  return (
    <div className="space-y-6">
      <Card className="py-4">
        <CardContent className="pt-0">
          <div className="flex flex-col items-center md:flex-row md:items-start md:space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/wei-icon.jpg" alt={editableUserData.name} />
              <AvatarFallback>{editableUserData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            
            <div className="mt-4 md:mt-0 text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold">{editableUserData.name}</h1>
              <p className="text-muted-foreground">{editableUserData.email}</p>
              <p className="text-sm text-muted-foreground">Member since March 2023</p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 md:mt-0 md:self-start flex items-center gap-2"
              onClick={handleEditProfile}
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-3 gap-4">
        <Card className="py-2 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-2 px-2">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="rounded-full bg-orange-100 dark:bg-orange-800 p-3">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-bold">{streak}</h2>
                <p className="text-sm font-medium">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="py-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-2 px-2">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="rounded-full bg-blue-100 dark:bg-blue-800 p-3">
                <BarChart className="h-6 w-6 text-blue-500" />
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-bold">{completionRate}</h2>
                <p className="text-sm font-medium">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="py-2 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-2 px-2">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="rounded-full bg-yellow-100 dark:bg-yellow-800 p-3">
                <Award className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-bold">{userPoints}</h2>
                <p className="text-sm font-medium">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <p className="text-center text-muted-foreground">No recent activity found.</p>
                ) : (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{activity.action} {activity.target}</p>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                      </div>
                      <Badge variant={activity.points > 0 ? "default" : "destructive"}>
                        {activity.points > 0 ? `+${activity.points}` : activity.points} pts
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map(achievement => (
              <Card 
                key={achievement.id}
                className={achievement.earned ? "bg-primary-50 border-primary-200 dark:bg-primary-950 dark:border-primary-800" : "opacity-60"}
              >
                <CardContent className="pt-6 flex items-center gap-4">
                  <div className="text-4xl">{achievement.icon}</div>
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {achievement.name}
                      {achievement.earned && (
                        <Badge variant="default" className="ml-1">
                          <Sparkles className="h-3 w-3 mr-1" /> Earned
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={editableUserData.name}
                onChange={(e) => setEditableUserData({...editableUserData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={editableUserData.email}
                onChange={(e) => setEditableUserData({...editableUserData, email: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 