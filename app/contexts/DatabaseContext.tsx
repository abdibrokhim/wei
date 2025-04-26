"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { openDB, IDBPDatabase } from 'idb';
import { WeiDB } from '../types/database';
import { seedDatabase } from '../utils/seedData';

interface DatabaseContextType {
  db: IDBPDatabase<WeiDB> | null;
  isLoading: boolean;
  error: Error | null;
  userPoints: number;
  setUserPoints: (points: number) => Promise<void>;
  addHabit: (habit: Omit<WeiDB['habits']['value'], 'id' | 'createdAt'>) => Promise<string>;
  getHabits: () => Promise<WeiDB['habits']['value'][]>;
  completeHabit: (habitId: string) => Promise<void>;
  getCompletions: (habitId?: string, date?: Date) => Promise<WeiDB['completions']['value'][]>;
  addReward: (reward: Omit<WeiDB['rewards']['value'], 'id' | 'createdAt'>) => Promise<string>;
  getRewards: () => Promise<WeiDB['rewards']['value'][]>;
  redeemReward: (rewardId: string) => Promise<boolean>;
  getUserData: () => Promise<WeiDB['user']['value'] | null>;
  saveConversation: (messages: WeiDB['conversations']['value']['messages']) => Promise<string>;
  getConversations: () => Promise<WeiDB['conversations']['value'][]>;
  saveUserProfile: (profile: WeiDB['userProfile']['value']) => Promise<void>;
  getUserProfile: () => Promise<WeiDB['userProfile']['value'] | null>;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDB] = useState<IDBPDatabase<WeiDB> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [userPoints, setUserPointsState] = useState<number>(0);

  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB<WeiDB>('wei-database', 2, {
          upgrade(db, oldVersion, newVersion) {
            // Create object stores if they don't exist
            if (oldVersion < 1) {
              const habitStore = db.createObjectStore('habits', { keyPath: 'id' });
              habitStore.createIndex('by-category', 'category');
              
              const completionsStore = db.createObjectStore('completions', { keyPath: 'id' });
              completionsStore.createIndex('by-habit', 'habitId');
              completionsStore.createIndex('by-date', 'completedAt');
              
              db.createObjectStore('rewards', { keyPath: 'id' });
              db.createObjectStore('rewardRedemptions', { keyPath: 'id' });
              const userStore = db.createObjectStore('user', { keyPath: 'id' });
              db.createObjectStore('conversations', { keyPath: 'id' });
              
              // Add default user
              userStore.add({
                id: 'default',
                name: 'User',
                points: 0,
                streakDays: 0,
                lastActive: new Date()
              });
            }
            
            // Add userProfile store in version 2
            if (oldVersion < 2 && !db.objectStoreNames.contains('userProfile')) {
              const userProfileStore = db.createObjectStore('userProfile', { keyPath: 'id' });
              
              // Add default profile
              userProfileStore.add({
                id: 'default',
                name: 'User',
                email: 'user@example.com',
                bio: 'No bio yet',
                avatarUrl: '',
                joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              });
            }
          }
        });
        
        setDB(database);
        
        // Load initial user points
        const userData = await database.get('user', 'default');
        if (userData) {
          setUserPointsState(userData.points);
        }
        
        // Seed database with sample data
        await seedDatabase(database);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to init database:', err);
        setError(err instanceof Error ? err : new Error('Unknown database error'));
        setIsLoading(false);
      }
    };

    initDB();
    
    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  const setUserPoints = async (points: number) => {
    if (!db) return;
    
    await db.put('user', {
      id: 'default',
      name: 'User',
      points,
      streakDays: (await db.get('user', 'default'))?.streakDays || 0,
      lastActive: new Date()
    });
    
    setUserPointsState(points);
  };

  const addHabit = async (habit: Omit<WeiDB['habits']['value'], 'id' | 'createdAt'>) => {
    if (!db) throw new Error('Database not initialized');
    
    const id = `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.add('habits', {
      ...habit,
      id,
      createdAt: new Date()
    });
    
    return id;
  };

  const getHabits = async () => {
    if (!db) return [];
    return db.getAll('habits');
  };

  const completeHabit = async (habitId: string) => {
    if (!db) return;
    
    const habit = await db.get('habits', habitId);
    if (!habit) return;
    
    const completionId = `completion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.add('completions', {
      id: completionId,
      habitId,
      completedAt: new Date(),
      points: habit.points
    });
    
    // Update user points
    const userData = await db.get('user', 'default');
    if (userData) {
      await setUserPoints(userData.points + habit.points);
    }
  };

  const getCompletions = async (habitId?: string, date?: Date) => {
    if (!db) return [];
    
    if (habitId) {
      return db.getAllFromIndex('completions', 'by-habit', habitId);
    }
    
    if (date) {
      const allCompletions = await db.getAll('completions');
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      return allCompletions.filter(
        (completion: WeiDB['completions']['value']) => 
          completion.completedAt >= startOfDay && completion.completedAt <= endOfDay
      );
    }
    
    return db.getAll('completions');
  };

  const addReward = async (reward: Omit<WeiDB['rewards']['value'], 'id' | 'createdAt'>) => {
    if (!db) throw new Error('Database not initialized');
    
    const id = `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.add('rewards', {
      ...reward,
      id,
      createdAt: new Date()
    });
    
    return id;
  };

  const getRewards = async () => {
    if (!db) return [];
    return db.getAll('rewards');
  };

  const redeemReward = async (rewardId: string) => {
    if (!db) return false;
    
    const reward = await db.get('rewards', rewardId);
    if (!reward) return false;
    
    const userData = await db.get('user', 'default');
    if (!userData || userData.points < reward.cost) return false;
    
    const redemptionId = `redemption_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.add('rewardRedemptions', {
      id: redemptionId,
      rewardId,
      redeemedAt: new Date(),
      cost: reward.cost
    });
    
    // Update user points
    await setUserPoints(userData.points - reward.cost);
    
    return true;
  };

  const getUserData = async (): Promise<WeiDB['user']['value'] | null> => {
    if (!db) return null;
    const userData = await db.get('user', 'default');
    return userData || null;
  };

  const saveConversation = async (messages: WeiDB['conversations']['value']['messages']) => {
    if (!db) throw new Error('Database not initialized');
    
    const id = `conversation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.add('conversations', {
      id,
      messages,
      createdAt: new Date()
    });
    
    return id;
  };

  const getConversations = async () => {
    if (!db) return [];
    return db.getAll('conversations');
  };
  
  const saveUserProfile = async (profile: WeiDB['userProfile']['value']) => {
    if (!db) throw new Error('Database not initialized');
    await db.put('userProfile', profile);
  };
  
  const getUserProfile = async (): Promise<WeiDB['userProfile']['value'] | null> => {
    if (!db) return null;
    try {
      const profile = await db.get('userProfile', 'default');
      return profile || null;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  };

  const value: DatabaseContextType = {
    db,
    isLoading,
    error,
    userPoints,
    setUserPoints,
    addHabit,
    getHabits,
    completeHabit,
    getCompletions,
    addReward,
    getRewards,
    redeemReward,
    getUserData,
    saveConversation,
    getConversations,
    saveUserProfile,
    getUserProfile
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}; 