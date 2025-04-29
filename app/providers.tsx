"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { TranscriptProvider } from "./contexts/TranscriptContext";
import { EventProvider } from "./contexts/EventContext";
import { DatabaseProvider } from "./contexts/DatabaseContext";
import { UserCacheProvider } from "./contexts/UserCacheContext";
import { ChatProvider } from "./contexts/ChatContext";
import RealTimeStreamingMode from "./RealTimeStreamingMode";
import { usePathname } from "next/navigation";
import { DBLoader } from "./components/DBLoader";
import WhatsNewInfo from "./components/updates/WhatsNewInfo";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem forcedTheme={pathname === "/" ? undefined : "dark"}>
      <DatabaseProvider>
        <DBLoader>
          <UserCacheProvider>
            <ChatProvider>
              <EventProvider>
                <TranscriptProvider>
                  {pathname !== "/" && <WhatsNewInfo />}
                  {children}
                  {pathname !== "/" && <RealTimeStreamingMode />}
                </TranscriptProvider>
              </EventProvider>
            </ChatProvider>
          </UserCacheProvider>
        </DBLoader>
      </DatabaseProvider>
    </ThemeProvider>
  );
} 