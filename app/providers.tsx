"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { TranscriptProvider } from "./contexts/TranscriptContext";
import { EventProvider } from "./contexts/EventContext";
import { DatabaseProvider } from "./contexts/DatabaseContext";
import { ChatProvider } from "./contexts/ChatContext";
import RealTimeStreamingMode from "./RealTimeStreamingMode";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <DatabaseProvider>
        <ChatProvider>
          <EventProvider>
            <TranscriptProvider>
              {children}
              <RealTimeStreamingMode />
            </TranscriptProvider>
          </EventProvider>
        </ChatProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
} 