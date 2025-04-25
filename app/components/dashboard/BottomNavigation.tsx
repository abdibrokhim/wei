"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Gift, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  {
    label: "Home",
    icon: Home,
    href: "/dashboard",
  },
  {
    label: "Habits",
    icon: List,
    href: "/habits",
  },
  {
    label: "Rewards",
    icon: Gift,
    href: "/rewards",
  },
  {
    label: "Chat",
    icon: MessageSquare,
    href: "/chat",
  },
  {
    label: "Profile",
    icon: User,
    href: "/profile",
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 md:hidden">
      <div className="bg-background/80 backdrop-blur-md border-t">
        <nav className="flex justify-around">
          {items.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/dashboard' && pathname === '/');
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center py-2 px-3",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 