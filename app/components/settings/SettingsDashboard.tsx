"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  BellRing, 
  Moon, 
  LogOut, 
  HelpCircle, 
  FileText, 
  Shield, 
  Gift
} from "lucide-react";

export default function SettingsDashboard() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <BellRing className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-gray-500">Receive alerts and updates</p>
                </div>
              </div>
              <Switch 
                checked={notifications} 
                onCheckedChange={setNotifications} 
                aria-label="Toggle notifications"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Moon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                </div>
              </div>
              <Switch 
                checked={darkMode} 
                onCheckedChange={setDarkMode} 
                aria-label="Toggle dark mode"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Shield className="h-5 w-5 mr-3 text-gray-500" />
              <span>Privacy & Security</span>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Gift className="h-5 w-5 mr-3 text-gray-500" />
              <span>Referrals & Credits</span>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" size="lg">
              <FileText className="h-5 w-5 mr-3 text-gray-500" />
              <span>Terms & Conditions</span>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" size="lg">
              <HelpCircle className="h-5 w-5 mr-3 text-gray-500" />
              <span>Help & Support</span>
            </Button>
            
            <Button variant="destructive" className="w-full mt-4">
              <LogOut className="h-5 w-5 mr-2" />
              <span>Log Out</span>
            </Button>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-gray-500 mt-4">
          <p>App Version 1.0.0</p>
        </div>
      </div>
    </>
  );
} 