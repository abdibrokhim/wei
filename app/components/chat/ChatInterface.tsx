"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useChat } from "@/app/contexts/ChatContext";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, RefreshCw, History } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatHistory from "./ChatHistory";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface ChatInterfaceProps {
  fullHeight?: boolean;
}

export default function ChatInterface({ fullHeight }: ChatInterfaceProps) {
  const { messages, isTyping, sendMessage, clearMessages, loadConversation } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  
  // Determine if we're on the standalone chat page
  const isStandalonePage = pathname === "/chat";
  
  // Use fullHeight prop if provided, otherwise determine based on pathname
  const useFullHeight = fullHeight !== undefined ? fullHeight : isStandalonePage;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;
    
    setIsSending(true);
    setInputValue("");
    
    try {
      await sendMessage(inputValue.trim());
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
      // Focus on input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLoadConversation = (conversation: any) => {
    // Load the conversation messages to the chat
    if (conversation && conversation.messages) {
      // Exclude the welcome message (first message) from the conversation
      const messagesToLoad = conversation.messages.slice(1);
      
      // Load messages into the chat
      loadConversation(messagesToLoad);
      
      // Close drawer
      setIsDrawerOpen(false);
    }
  };

  return (
    <Card className={`flex gap-4 bg-transparent border-none shadow-none flex-col py-2 ${useFullHeight ? 'h-[85vh]' : 'h-[70vh]'}`}>
      <CardHeader className="pb-0 pt-0 px-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-gradient-to-br from-pink-500 to-rose-500">
              <AvatarImage src="/wei-icon.png" alt="Wei Icon" />
              <AvatarFallback>WEI</AvatarFallback>
            </Avatar>
            <span>Chat with Wei</span>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Chat History"
                >
                  <History className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  <DrawerHeader className="text-center">
                    <DrawerTitle>Conversation History</DrawerTitle>
                  </DrawerHeader>
                  
                  <ChatHistory onSelectConversation={handleLoadConversation} />

                </div>
              </DrawerContent>
            </Drawer>
            
            <Button variant="ghost" size="icon" onClick={clearMessages} title="Reset chat">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1 px-0 overflow-y-auto" ref={scrollAreaRef}>
        <div className="space-y-4 py-4">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
            />
          ))}
          
          {isTyping && (
            <div className="flex items-center gap-2 animate-pulse">
              <Avatar className="h-8 w-8 bg-gradient-to-br from-pink-500 to-rose-500">
                <AvatarImage src="/wei-icon.png" alt="Wei Icon" />
                <AvatarFallback>WEI</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">Wei is typing...</span>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <CardFooter className="pt-0 px-0">
        <div className="flex w-full gap-2">
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            ref={inputRef}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim() || isSending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 