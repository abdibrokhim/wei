import { NextResponse } from "next/server";
import OpenAI from "openai";

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

export async function POST(req: Request) {
  try {
    // Extract request parameters
    const { model, messages, functions, function_call, userCache } = await req.json();

    // Set up the completion options
    const completionOptions: any = {
      model,
      messages,
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

    // Check if the model has generated a function call
    const message = completion.choices[0].message;
    
    if (message.function_call) {
      // Handle the function call using cached data if available
      const functionResponse = await handleFunctionCall(message.function_call, userCache);
      
      // Add the function call and result to the messages for a follow-up
      const newMessages = [
        ...messages,
        {
          role: 'assistant',
          content: null,
          function_call: message.function_call
        },
        {
          role: 'function',
          name: message.function_call.name,
          content: functionResponse
        }
      ];
      
      // Call the model again with the function result
      const followUpCompletion = await openai.chat.completions.create({
        model,
        messages: newMessages,
        functions: completionOptions.functions,
        function_call: 'auto'
      });
      
      return NextResponse.json(followUpCompletion);
    }

    if (message.tool_calls) {
      // Handle tool calls in the OpenAI format
      const toolResponse = await handleToolCalls(message.tool_calls, userCache);
      
      // Add the tool calls and result to messages for follow-up
      const newMessages = [
        ...messages,
        {
          role: 'assistant',
          content: null,
          tool_calls: message.tool_calls
        }
      ];
      
      // Add each tool response
      for (const toolCall of toolResponse) {
        newMessages.push({
          role: 'tool',
          tool_call_id: toolCall.tool_call_id,
          content: toolCall.content
        });
      }
      
      // Call the model again with the tool results
      const followUpCompletion = await openai.chat.completions.create({
        model,
        messages: newMessages,
        tools: completionOptions.functions.map((fn: any) => ({ type: 'function', function: fn })),
        tool_choice: 'auto'
      });
      
      return NextResponse.json(followUpCompletion);
    }

    return NextResponse.json(completion);
  } catch (error: any) {
    console.error("Error in /chat/completions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handle function calls using cached data
async function handleFunctionCall(functionCall: any, userCache: any) {
  const { name, arguments: argsString } = functionCall;
  let args;
  
  try {
    args = JSON.parse(argsString);
  } catch (e) {
    return JSON.stringify({ error: "Invalid function arguments" });
  }

  // If we have userCache, use it for function responses
  if (userCache) {
    return await handleDatabaseFunction(name, args, userCache);
  }

  // Otherwise return a message that the function isn't available without cached data
  return JSON.stringify({
    error: "This function requires user data that is not currently available.",
    message: "Please try refreshing the page to load your latest data."
  });
}

// Handle tool calls using cached data
async function handleToolCalls(toolCalls: any, userCache: any) {
  const responses = [];
  
  for (const toolCall of toolCalls) {
    if (toolCall.type === 'function') {
      const { name, arguments: argsString } = toolCall.function;
      let args;
      
      try {
        args = JSON.parse(argsString);
      } catch (e) {
        responses.push({
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: "Invalid function arguments" })
        });
        continue;
      }
      
      const result = await handleDatabaseFunction(name, args, userCache);
      responses.push({
        tool_call_id: toolCall.id,
        content: result
      });
    }
  }
  
  return responses;
}

// Central handler for all database functions with user cache
async function handleDatabaseFunction(name: string, args: any, userCache: any) {
  if (!userCache) {
    return JSON.stringify({ 
      error: "User data not available",
      message: "Please try refreshing the page to load your latest data." 
    });
  }

  switch (name) {
    case "getUserProfile":
      const { fields = [] } = args;
      
      if (fields.length === 0) {
        return JSON.stringify(userCache.profile);
      }
      
      const filteredProfile: Record<string, any> = {};
      fields.forEach((field: string) => {
        if (field in userCache.profile) {
          filteredProfile[field] = userCache.profile[field];
        }
      });
      
      return JSON.stringify(filteredProfile);
    
    case "getUserHabits":
      return JSON.stringify({ habits: userCache.habits });
    
    case "getHabitCompletions":
      const { daysAgo = 30 } = args;
      
      if (daysAgo === 30) {
        // If the default value is used, just return the cached completions
        return JSON.stringify({ completions: userCache.completions });
      }
      
      // Otherwise filter by the requested days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      
      const filteredCompletions = userCache.completions.filter(
        (completion: any) => new Date(completion.completedAt) >= startDate
      );
      
      return JSON.stringify({ completions: filteredCompletions });
    
    case "getUserStats":
      return JSON.stringify({
        points: userCache.points,
        streakDays: userCache.streak
      });
    
    case "getUserRewards":
      return JSON.stringify({ rewards: userCache.rewards });
    
    case "getRewardRedemptions":
      const daysAgo2 = args.daysAgo || 30;
      
      if (daysAgo2 === 30) {
        // If the default value is used, just return the cached redemptions
        return JSON.stringify({ redemptions: userCache.redemptions });
      }
      
      // Otherwise filter by the requested days
      const startDate2 = new Date();
      startDate2.setDate(startDate2.getDate() - daysAgo2);
      
      const filteredRedemptions = userCache.redemptions.filter(
        (redemption: any) => new Date(redemption.redeemedAt) >= startDate2
      );
      
      return JSON.stringify({ redemptions: filteredRedemptions });
    
    case "completeHabit":
      if (!args.habitId) {
        return JSON.stringify({ error: "habitId is required" });
      }
      return JSON.stringify({
        message: "To complete this habit, the user needs to use the client-side interface. Please instruct them to click the complete button for this habit in the habits tab.",
        habitId: args.habitId
      });
    
    case "redeemReward":
      if (!args.rewardId) {
        return JSON.stringify({ error: "rewardId is required" });
      }
      return JSON.stringify({
        message: "To redeem this reward, the user needs to use the client-side interface. Please instruct them to click the redeem button for this reward in the rewards tab.",
        rewardId: args.rewardId
      });
    
    case "calculateBonusPoints":
      if (!args.habitId || !args.basePoints) {
        return JSON.stringify({ 
          error: "Both habitId and basePoints are required" 
        });
      }
      
      try {
        // Filter completions for this habit
        const habitCompletions = userCache.completions.filter(
          (completion: any) => completion.habitId === args.habitId
        );
        
        // Calculate chain bonus (consecutive days)
        let chainBonus = 0;
        if (habitCompletions.length > 0) {
          chainBonus = Math.min(3, Math.floor(habitCompletions.length / 2));
        }
        
        // Calculate streak bonus
        const streakBonus = Math.min(5, Math.floor(userCache.streak / 3));
        
        // Calculate consistency bonus
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastWeekCompletions = userCache.completions.filter((completion: any) => {
          const completionDate = new Date(completion.completedAt);
          const daysDiff = Math.floor((today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff < 7;
        });
        
        const consistencyBonus = Math.min(2, Math.floor(lastWeekCompletions.length / 3));
        
        // Calculate total
        const totalBonus = chainBonus + streakBonus + consistencyBonus;
        const totalPoints = args.basePoints + totalBonus;
        
        return JSON.stringify({
          basePoints: args.basePoints,
          chainBonus,
          streakBonus,
          consistencyBonus,
          totalBonus,
          totalPoints,
          explanation: `${args.basePoints} base + ${chainBonus} chain + ${streakBonus} streak + ${consistencyBonus} consistency = ${totalPoints} total`
        });
      } catch (error) {
        console.error("Error calculating bonus points:", error);
        return JSON.stringify({ 
          error: "Failed to calculate bonus points",
          basePoints: args.basePoints,
          totalPoints: args.basePoints // Fall back to base points only
        });
      }
    
    default:
      return JSON.stringify({ error: `Function ${name} not implemented` });
  }
}
