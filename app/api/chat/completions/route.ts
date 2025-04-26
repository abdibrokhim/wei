import { NextResponse } from "next/server";
import OpenAI from "openai";
import { 
  getUserDataForAgent, 
  getUserProfile, 
  getUserHabits, 
  getHabitCompletions, 
  completeHabit, 
  getUserStats, 
  getUserRewards, 
  getRewardRedemptions 
} from "@/app/utils/agentDatabaseTools";
import { openDB } from "idb";

const openai = new OpenAI();

// Define default functions that all agents can access
const defaultFunctions = [
  {
    name: "getUserProfile",
    description: "Get the user's profile information",
    parameters: {
      type: "object",
      properties: {
        fields: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Optional array of specific profile fields to retrieve"
        }
      },
      required: []
    }
  },
  {
    name: "getUserHabits",
    description: "Get the list of habits the user has created",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "getHabitCompletions",
    description: "Get the list of habit completions for the past X days",
    parameters: {
      type: "object",
      properties: {
        daysAgo: {
          type: "number",
          description: "Get completions from this many days ago (default 30)"
        }
      },
      required: []
    }
  },
  {
    name: "completeHabit",
    description: "Mark a habit as complete and award points to the user",
    parameters: {
      type: "object",
      properties: {
        habitId: {
          type: "string",
          description: "The ID of the habit to mark as complete"
        }
      },
      required: ["habitId"]
    }
  },
  {
    name: "getUserStats",
    description: "Get the user's current points balance and streak information",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "getUserRewards",
    description: "Get the list of rewards available to the user",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "getRewardRedemptions",
    description: "Get the user's past reward redemptions",
    parameters: {
      type: "object",
      properties: {
        daysAgo: {
          type: "number",
          description: "Get redemptions from this many days ago (default 30)"
        }
      },
      required: []
    }
  },
  {
    name: "redeemReward",
    description: "Redeem a reward for the user, deducting points from their balance",
    parameters: {
      type: "object",
      properties: {
        rewardId: {
          type: "string",
          description: "The ID of the reward to redeem"
        }
      },
      required: ["rewardId"]
    }
  },
  {
    name: "calculateBonusPoints",
    description: "Calculate bonus points based on streak, consistency, and habit difficulty",
    parameters: {
      type: "object",
      properties: {
        habitId: {
          type: "string",
          description: "The ID of the habit to calculate bonuses for"
        },
        basePoints: {
          type: "number",
          description: "The base points awarded for this habit"
        }
      },
      required: ["habitId", "basePoints"]
    }
  }
];

// Function implementation map
const functionImplementations = {
  getUserProfile: async (args: any) => {
    try {
      const fields = args.fields || [];
      return await getUserProfile(fields);
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      return { error: "Failed to retrieve user profile" };
    }
  },
  getUserHabits: async () => {
    try {
      const habits = await getUserHabits();
      return { habits };
    } catch (error) {
      console.error("Error in getUserHabits:", error);
      return { error: "Failed to retrieve habits" };
    }
  },
  getHabitCompletions: async (args: any) => {
    try {
      const daysAgo = args.daysAgo || 30;
      const completions = await getHabitCompletions(daysAgo);
      return { completions };
    } catch (error) {
      console.error("Error in getHabitCompletions:", error);
      return { error: "Failed to retrieve habit completions" };
    }
  },
  completeHabit: async (args: any) => {
    try {
      return await completeHabit(args.habitId);
    } catch (error) {
      console.error("Error in completeHabit:", error);
      return { success: false, message: "Failed to complete habit" };
    }
  },
  getUserStats: async () => {
    try {
      return await getUserStats();
    } catch (error) {
      console.error("Error in getUserStats:", error);
      return { error: "Failed to retrieve user stats" };
    }
  },
  getUserRewards: async () => {
    try {
      const rewards = await getUserRewards();
      return { rewards };
    } catch (error) {
      console.error("Error in getUserRewards:", error);
      return { error: "Failed to retrieve rewards" };
    }
  },
  getRewardRedemptions: async (args: any) => {
    try {
      const daysAgo = args.daysAgo || 30;
      const redemptions = await getRewardRedemptions(daysAgo);
      return { redemptions };
    } catch (error) {
      console.error("Error in getRewardRedemptions:", error);
      return { error: "Failed to retrieve reward redemptions" };
    }
  },
  redeemReward: async (args: any) => {
    try {
      // Implementation since there's no direct export of redeemReward
      const db = await openDB('wei-database', 2);
      
      // Get the reward details
      const reward = await db.get('rewards', args.rewardId);
      if (!reward) {
        db.close();
        return { 
          success: false, 
          message: "Reward not found" 
        };
      }
      
      // Get the user's current points
      const userData = await db.get('user', 'default');
      if (!userData || userData.points < reward.cost) {
        db.close();
        return { 
          success: false, 
          message: "Not enough points to redeem this reward" 
        };
      }
      
      // Create redemption record
      const redemptionId = `redemption_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.add('rewardRedemptions', {
        id: redemptionId,
        rewardId: args.rewardId,
        redeemedAt: new Date(),
        cost: reward.cost
      });
      
      // Update user points
      await db.put('user', {
        ...userData,
        points: userData.points - reward.cost,
        lastActive: new Date()
      });
      
      // Get updated user stats
      const updatedUserData = await db.get('user', 'default');
      db.close();
      
      return { 
        success: true, 
        message: "Reward redeemed successfully", 
        newPoints: updatedUserData?.points || 0
      };
    } catch (error) {
      console.error("Error in redeemReward:", error);
      return { success: false, message: "Failed to redeem reward" };
    }
  },
  calculateBonusPoints: async (args: any) => {
    try {
      // Get user's habit completions to calculate streaks and consistency
      const completions = await getHabitCompletions(30);
      
      // Filter completions for this specific habit
      const habitCompletions = completions.filter(
        completion => completion.habitId === args.habitId
      );
      
      // Get user stats for streak information
      const stats = await getUserStats();
      
      // Calculate chain bonus (consecutive days)
      let chainBonus = 0;
      if (habitCompletions.length > 0) {
        // Sort by date, newest first
        const sortedCompletions = [...habitCompletions].sort(
          (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
        
        // Check if there was a completion yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        const yesterdayCompletion = sortedCompletions.find(completion => {
          const completionDate = new Date(completion.completedAt);
          completionDate.setHours(0, 0, 0, 0);
          return completionDate.getTime() === yesterday.getTime();
        });
        
        if (yesterdayCompletion) {
          chainBonus = Math.min(3, Math.floor(habitCompletions.length / 2));
        }
      }
      
      // Calculate streak bonus
      const streakBonus = Math.min(5, Math.floor(stats.streakDays / 3));
      
      // Calculate consistency bonus (based on completion frequency)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastWeekCompletions = completions.filter(completion => {
        const completionDate = new Date(completion.completedAt);
        const daysDiff = Math.floor((today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff < 7;
      });
      
      const consistencyBonus = Math.min(2, Math.floor(lastWeekCompletions.length / 3));
      
      // Calculate total bonus
      const totalBonus = chainBonus + streakBonus + consistencyBonus;
      const totalPoints = args.basePoints + totalBonus;
      
      return {
        basePoints: args.basePoints,
        chainBonus,
        streakBonus,
        consistencyBonus,
        totalBonus,
        totalPoints,
        explanation: `${args.basePoints} base + ${chainBonus} chain + ${streakBonus} streak + ${consistencyBonus} consistency = ${totalPoints} total`
      };
    } catch (error) {
      console.error("Error in calculateBonusPoints:", error);
      return { 
        error: "Failed to calculate bonus points",
        basePoints: args.basePoints,
        totalPoints: args.basePoints
      };
    }
  }
};

// Handle function calls
async function handleFunctionCall(functionCall: any) {
  const { name, arguments: argsString } = functionCall;
  const args = JSON.parse(argsString);
  
  if (name in functionImplementations) {
    const result = await functionImplementations[name as keyof typeof functionImplementations](args);
    return JSON.stringify(result);
  } else {
    return JSON.stringify({ error: `Function ${name} not implemented` });
  }
}

export async function POST(req: Request) {
  try {
    const { model, messages, functions, function_call } = await req.json();

    // Get user data for agent context
    const userData = await getUserDataForAgent();
    
    // Create system message with user data if not already present
    let hasSystemMessage = false;
    let updatedMessages = [...messages];
    
    for (const message of messages) {
      if (message.role === 'system') {
        hasSystemMessage = true;
        break;
      }
    }
    
    // If no system message exists, add one with user data
    if (!hasSystemMessage && userData) {
      const userContext = `
You have access to the following user data:
- User profile: ${JSON.stringify(userData.profile)}
- Current points: ${userData.points}
- Current streak: ${userData.streak}
- Habits: ${JSON.stringify(userData.habits)}
- Recent activity: ${JSON.stringify(userData.recentActivity)}

Use this information to personalize your responses to the user.
`;
      
      updatedMessages.unshift({
        role: 'system',
        content: userContext
      });
    }

    // Set up the completion options
    const completionOptions: any = {
      model,
      messages: updatedMessages,
    };

    // Use client-provided functions or default functions
    if (functions) {
      completionOptions.functions = functions;
    } else {
      completionOptions.functions = defaultFunctions;
    }

    // Handle function_call parameter
    if (function_call) {
      completionOptions.function_call = function_call;
    } else {
      completionOptions.function_call = 'auto';
    }

    // Make the API call
    const completion = await openai.chat.completions.create(completionOptions);

    // Check if the model called a function
    const message = completion.choices[0].message;
    
    if (message.tool_calls) {
      // Handle the function call
      const functionResult = await handleFunctionCall(message.tool_calls);
      
      // Add the function call and result to the messages
      const newMessages = [
        ...updatedMessages,
        message,
        {
          role: 'function',
          name: message.tool_calls[0].function.name,
          content: functionResult
        }
      ];
      
      // Call the model again with the function result
      const followUpCompletion = await openai.chat.completions.create({
        model,
        messages: newMessages,
        functions: completionOptions.functions,
        function_call: completionOptions.function_call
      });
      
      return NextResponse.json(followUpCompletion);
    }

    return NextResponse.json(completion);
  } catch (error: any) {
    console.error("Error in /chat/completions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
