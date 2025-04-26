"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Leaf } from "@phosphor-icons/react/dist/ssr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useDatabase } from "@/app/contexts/DatabaseContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Award, 
  Flame, 
  Calendar, 
  BarChart, 
  Edit,
  Sparkles,
} from "lucide-react";
import { WeiDB } from "@/app/types/database";
import EditProfileDrawer from "./EditProfileDrawer";
import { MAX_FILE_SIZE } from "@/lib/config";

interface Activity {
  id: number;
  action: string;
  target: string;
  date: string;
  points: number;
}

export default function ProfileDashboard() {
  const { userPoints, getCompletions, getHabits, getUserProfile, saveUserProfile } = useDatabase();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [profileData, setProfileData] = useState<WeiDB['userProfile']['value']>({
    id: 'default',
    name: "User",
    email: "user@example.com",
    bio: "No bio yet",
    avatarUrl: "",
    joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  });
  
  const [editableProfileData, setEditableProfileData] = useState<WeiDB['userProfile']['value']>(profileData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [completionRate, setCompletionRate] = useState("0%");
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  
  // Achievements data
  const achievements = [
    { id: 1, name: "First Step", description: "Complete your first habit", earned: true },
    { id: 2, name: "Week Warrior", description: "7 day streak", earned: true },
    { id: 3, name: "Early Bird", description: "Complete a habit before 8am", earned: false },
    { id: 4, name: "Night Owl", description: "Complete a habit after 10pm", earned: false }
  ];
  
  // Load user profile from IndexedDB
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (profile) {
          setProfileData(profile);
          setEditableProfileData(profile);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };
    
    loadUserProfile();
  }, [getUserProfile]);
  
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
    setIsEditDrawerOpen(true);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file is an image and not too large
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) { // 5MB limit
      toast.error('Image too large. Please select an image under 5MB');
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSaveProfile = async () => {
    try {
      // Process the image file if it exists
      let avatarUrl = profileData.avatarUrl;
      if (imageFile) {
        avatarUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(imageFile);
        });
      }
      
      // Create updated profile data
      const updatedProfile = {
        ...editableProfileData,
        avatarUrl,
        id: 'default', // Ensure we're using the same ID
      };
      
      // Save to IndexedDB
      await saveUserProfile(updatedProfile);
      
      // Update state
      setProfileData(updatedProfile);
      setIsEditDrawerOpen(false);
      setImageFile(null);
      setImagePreview(null);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to update profile');
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Profile Header - Instagram Style */}
      <Card className="bg-transparent border-none shadow-none flex-col p-0">
        <CardContent className="p-0">
          <div className="flex items-start gap-4">
            {/* Profile Image */}
            <div className="relative">
              <Avatar className="h-20 w-20 border-1 border-foreground">
                <AvatarImage src={profileData.avatarUrl || "/wei-icon.png"} alt={profileData.name} />
                <AvatarFallback>{profileData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <Button 
                variant="secondary" 
                size="icon" 
                className="absolute bottom-0 right-0 size-6 rounded-full opacity-90"
                onClick={handleEditProfile}
              >
                <Edit className="size-3" />
              </Button>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold">{profileData.name}</h1>
              </div>
              <p className="text-sm text-muted-foreground">{profileData.email}</p>
              <p className="text-[10px] text-muted-foreground/70">Member since {profileData.joinDate}</p>
              
              {profileData.bio && (
                <p className="mt-2 text-sm">{profileData.bio}</p>
              )}
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="relative flex flex-col items-center text-center p-2 rounded-md">
              <span className="text-lg font-semibold">{streak}</span>
              <span className="text-xs text-muted-foreground">Day Streak</span>
            </div>
            
            <div className="relative flex flex-col items-center text-center p-2 rounded-md">
              <span className="text-lg font-semibold">{completionRate}</span>
              <span className="text-xs text-muted-foreground">Completion</span>
            </div>
            
            <div className="relative flex flex-col items-center text-center p-2 rounded-md">
              <span className="text-lg font-semibold">{userPoints}</span>
              <span className="text-xs text-muted-foreground">Points</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for Activity and Achievements */}
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-transparent border-none">
          <TabsTrigger value="overview">Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-2 space-y-4">
          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm">No recent activity found.</p>
                ) : (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex justify-between items-center border-b border-border pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium">{activity.action} {activity.target}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                      </div>
                      <Badge variant={activity.points > 0 ? "default" : "destructive"} className="text-xs">
                        {activity.points > 0 ? `+${activity.points}` : activity.points} pts
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-2">
          <div className="grid grid-cols-2 gap-3">
            {achievements.map(achievement => (
              <Card 
                key={achievement.id}
                className={`bg-card p-2 ${achievement.earned ? "" : "opacity-60"}`}
              >
                <CardContent className="relative p-1 flex flex-row items-center text-start gap-2">
                  <div className="space-y-1 flex flex-col items-start">
                    <h3 className="text-sm font-medium flex flex-col items-start gap-1">
                      {achievement.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    {achievement.earned && (
                      <Badge variant="default" className="text-[10px] absolute top-0 right-0">
                        earned
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Edit Profile Drawer */}
      <EditProfileDrawer 
        isEditDrawerOpen={isEditDrawerOpen}
        setIsEditDrawerOpen={setIsEditDrawerOpen}
        editableProfileData={editableProfileData}
        setEditableProfileData={setEditableProfileData}
        imagePreview={imagePreview || ""}
        handleImageChange={handleImageChange}
        handleSaveProfile={handleSaveProfile}
      />
    </div>
  );
} 