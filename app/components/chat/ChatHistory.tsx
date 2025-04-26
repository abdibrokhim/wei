"use client";

import { useState, useEffect, useRef } from "react";
import { useDatabase } from "@/app/contexts/DatabaseContext";
import { formatDistanceToNow } from "date-fns";
import { CaretRight, ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr";

interface ChatHistoryProps {
  onSelectConversation: (conversation: any) => void;
}

export default function ChatHistory({ onSelectConversation }: ChatHistoryProps) {
  const { getConversations } = useDatabase();
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const loadConversationHistory = async () => {
    setIsLoading(true);
    try {
      const conversations = await getConversations();
      // Sort conversations by date, newest first
      const sortedConversations = conversations.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setConversationHistory(sortedConversations);
    } catch (error) {
      console.error("Failed to load conversation history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load conversation history when component mounts
  useEffect(() => {
    loadConversationHistory();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 px-0 overflow-y-auto" ref={scrollAreaRef}>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : conversationHistory.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No conversation history found</p>
          </div>
        ) : (
          <div className="space-y-2 my-4 h-[60vh] overflow-y-auto">
            {conversationHistory.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer"
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <ClockCounterClockwise className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {conversation.messages[1]?.content.substring(0, 40)}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <CaretRight className="size-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
