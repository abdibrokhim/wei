"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDatabase } from './DatabaseContext';

interface Message {
  id: string;
  sender: 'user' | 'wei';
  content: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: Message[];
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  loadConversation: (conversationMessages: Message[]) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { saveConversation, getCompletions, userPoints } = useDatabase();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: `msg_${Date.now()}`,
      sender: 'wei',
      content: "Hi there! \nI'm **Wei**, your personal habit assistant. _How can I help you today?_",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Function to generate a response from Wei using OpenAI API
  const getWeiResponse = async (userMessage: string, previousMessages: Message[]): Promise<string> => {
    setIsTyping(true);
    
    try {
      // Get today's completions for context
      const todayCompletions = await getCompletions(undefined, new Date());
      const completedHabitsCount = new Set(todayCompletions.map(c => c.habitId)).size;
      
      // Format messages for the OpenAI API
      const formattedMessages = [
        {
          role: "system",
          content: `You are Wei, an AI assistant that helps users build better habits. 
            You are friendly, motivational, and concise. Your goal is to help users track 
            their habits, earn points, and redeem rewards.
            
            The user has currently earned ${userPoints} points and has completed ${completedHabitsCount} 
            habits today. Acknowledge their progress if appropriate.
            
            Keep your responses concise and actionable. If they mention a specific topic 
            like exercise, nutrition, sleep, or mental health, provide relevant tips.`
        },
        // Add previous conversation context
        ...previousMessages.map(msg => ({
          role: msg.sender === 'wei' ? 'assistant' : 'user',
          content: msg.content
        })),
        // Add the current user message
        {
          role: "user",
          content: userMessage
        }
      ];
      
      // Call OpenAI API
      const response = await fetch("/api/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          model: "gpt-4o-mini",  // Use an appropriate model
          messages: formattedMessages
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }
      
      const completion = await response.json();
      return completion.choices[0].message.content;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I'm having trouble connecting right now. Can you try again later?";
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender: 'user',
      content,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Get Wei's response
    const weiResponse = await getWeiResponse(content, messages);
    
    // Add Wei's response
    const weiMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender: 'wei',
      content: weiResponse,
      timestamp: new Date()
    };
    
    const finalMessages = [...updatedMessages, weiMessage];
    setMessages(finalMessages);
    
    // Save the conversation to the database
    await saveConversation(finalMessages);
  };

  const clearMessages = () => {
    // Keep only the welcome message
    setMessages(prev => prev.filter((_, index) => index === 0));
  };

  const loadConversation = (conversationMessages: Message[]) => {
    // If there are messages in the conversation, replace current messages
    if (conversationMessages && conversationMessages.length > 0) {
      // Get the first welcome message from current chat
      const welcomeMessage = messages[0];
      
      // Set the welcome message followed by the conversation messages
      setMessages([welcomeMessage, ...conversationMessages]);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, isTyping, sendMessage, clearMessages, loadConversation }}>
      {children}
    </ChatContext.Provider>
  );
}; 