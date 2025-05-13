# [Tutorial]: 🌱 Wei: The AI Agents For Personal Growth

Recently I participated in a LocalDown hackathon. 
I built Wei, an AI agent that helps you build good habits. 

TLDR: 🌱 Wei is your conversational AI agent that makes habit-building effortless through natural dialogue. Speak with Wei, earn points for consistency, and transform daily routines into rewarding experiences—all with a playful personality that keeps you motivated on your wellness journey. 

I won 3rd place in the hackathon. 
Here's a comprehensive tutorial on how to build your own from very scratch.

Let's get started.


## Introduction

In this tutorial, I'll be guiding you through the whole process of building Wei. This is a pretty comprehensive tutorial, so I'll be covering a lot of ground. Cool part we'll build AI Agents SDK from scratch (referring to the official OpenAI Agents Python SDK).

Including but not limited to: 

- Setting up the initial project
- Building the custom AI Agents SDK with complex system instructions
- Building the *beautiful* and *cool* UI/UX with Shadcn UI, Motion Primitives, Prompt Kit and TailwindCSS with minimalistic icons from Phosphor Icons
- Integrating with AI/ML API and OpenAI Realtime API
- Storing data locally using IndexedDB
- Deploying the app to Vercel
- and many more........

So... make sure to lock in and build along with me.

Wei is powered by the latest and greatest tools:

- [AI/ML API](https://aimlapi.com)
- [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)
- [Custom AI Agents SDK inspired by OpenAI's Agents SDK](https://openai.github.io/openai-agents-python/)
- [NextJS](https://nextjs.org)
- [Shadcn UI](https://ui.shadcn.com)
- [Motion Primitives](https://motion-primitives.com/docs)
- [Prompt Kit](https://www.prompt-kit.com/)
- [TailwindCSS](https://tailwindcss.com)
- [Phosphor Icons](https://phosphoricons.com)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Vercel](https://vercel.com)

> r u a designer? try [Anora - Inteligent canvas for infinite creativity](https://anora.yaps.gg)

## Setting up the initial project

Install and configure shadcn/ui for Next.js.

Run the init command to create a new Next.js project or to setup an existing one:

```bash
npx shadcn@latest init
```

We can now start adding components...

```bash
npx shadcn@latest add button
```

The command above will add the *Button* component to your project. You can then import it like this:

```tsx
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div>
      <Button>WEI</Button>
    </div>
  )
}
```


## Building the custom AI Agents SDK

We need approx. 6 to 7 AI Agents to build Wei. 
They are responsible for different aspects of the app.

> more agents even more fun.

Wei can handle multiple agents at once. 

- **Greeter Agent**: This agent is responsible for greeting the user and providing a personalized welcome experience.
- **General Agent**: This agent is responsible for general purpose tasks like answering questions, providing information, etc.
- **Habit Agent**: This agent is responsible for habit related tasks like adding habits, tracking progress, etc.
- **Reward Agent**: This agent is responsible for reward related tasks like adding rewards, tracking progress, etc.
- **Streak Agent**: This agent is responsible for streak related tasks like adding streaks, tracking progress, etc.
- **Points Agent**: This agent is responsible for points related tasks like adding points, tracking progress, etc.
- **Completion Agent**: This agent is responsible for completion related tasks like adding completions, tracking progress, etc.

All AI Agents are able to transfer control to each other. 
Call proper tools and execute them.

### Custom made AI Agents SDK (from scratch)

We'll be referring to the official OpenAI Agents Python SDK to build our own custom made AI Agents SDK in Typecript.

Create a new file `types.ts` inside the `app` folder. 
And add the following code:

```tsx
export type SessionStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED";

export interface ToolParameterProperty {
  type: string;
  description?: string;
  enum?: string[];
  pattern?: string;
  properties?: Record<string, ToolParameterProperty>;
  required?: string[];
  additionalProperties?: boolean;
  items?: ToolParameterProperty;
}

export interface ToolParameters {
  type: string;
  properties: Record<string, ToolParameterProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface Tool {
  type: "function";
  name: string;
  description: string;
  parameters: ToolParameters;
}

export interface AgentConfig {
  name: string;
  publicDescription: string; // gives context to agent transfer tool
  instructions: string;
  tools: Tool[];
  toolLogic?: Record<
    string,
    (args: any, transcriptLogsFiltered: TranscriptItem[]) => Promise<any> | any
  >;
  downstreamAgents?: AgentConfig[] | { name: string; publicDescription: string }[];
}

export type AllAgentConfigsType = Record<string, AgentConfig[]>;

export interface TranscriptItem {
  itemId: string;
  type: "MESSAGE" | "BREADCRUMB";
  role?: "user" | "assistant";
  title?: string;
  data?: Record<string, any>;
  expanded: boolean;
  timestamp: string;
  createdAtMs: number;
  status: "IN_PROGRESS" | "DONE";
  isHidden: boolean;
}

export interface Log {
  id: number;
  timestamp: string;
  direction: string;
  eventName: string;
  data: any;
  expanded: boolean;
  type: string;
}

export interface ServerEvent {
  type: string;
  event_id?: string;
  item_id?: string;
  transcript?: string;
  delta?: string;
  session?: {
    id?: string;
  };
  item?: {
    id?: string;
    object?: string;
    type?: string;
    status?: string;
    name?: string;
    arguments?: string;
    role?: "user" | "assistant";
    content?: {
      type?: string;
      transcript?: string | null;
      text?: string;
    }[];
  };
  response?: {
    output?: {
      type?: string;
      name?: string;
      arguments?: any;
      call_id?: string;
    }[];
    status_details?: {
      error?: any;
    };
  };
}

export interface LoggedEvent {
  id: number;
  direction: "client" | "server";
  expanded: boolean;
  timestamp: string;
  eventName: string;
  eventData: Record<string, any>; // can have arbitrary objects logged
}

export interface Activity {
  points: number;
  description: string;
}

export interface Routine {
  name: string;
  activities: Activity[];
}
```

> file location: `app/types.ts`


## Wei's AI Agents

Let's start with something simple: `Greeter Agent`.

### Greeter Agent

This agent is responsible for greeting the user and providing a personalized welcome experience.
It has access to the user's profile information, habits, completions, points, streak, and recent activity.
When done it will transfer control to the `General Agent`.

```ts
import { AgentConfig } from "@/app/types";
import { getUserDataForAgent } from "@/app/utils/agentDatabaseTools";
import { injectTransferTools } from "./utils";
import { general } from "./general";

const greeter: AgentConfig = {
  name: "greeter",
  publicDescription:
    "A friendly welcome agent that greets users and provides a personalized welcome experience.",
  instructions: `
# Personality
You are Wei, a warm and friendly wellness buddy. Your role is to greet users with personalized welcome messages that acknowledge their progress, habits, and achievements. Your tone is encouraging, positive, and conversational. 
... omitted for brevity. 
`,
  tools: [
    {
      type: "function",
      name: "getUserData",
      description:
        "Get the user's profile information, habits, completions, rewards, points, streak, and recent activity.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  ],
  toolLogic: {
    getUserData: async () => {
      try {
        const userData = await getUserDataForAgent();
        return userData;
      } catch (error) {
        console.error("Error getting user data for greeter agent:", error);
        return {
          error: "Failed to retrieve user data. Please try again later."
        };
      }
    },
  },
  downstreamAgents: [general],
};

const agents = injectTransferTools([greeter, general]);

export default agents;
```

> file location: `app/agentConfigs/greeter.ts`


### General Agent

This agent is responsible for general purpose tasks like answering questions, providing information, marking habits as complete, etc.
It has access to the user's profile information, habits, completions, points, streak, and recent activity.
It can call: `getUserData`, `completeHabit`.

```ts
import { AgentConfig, TranscriptItem } from "@/app/types";
import { getUserDataForAgent, completeHabit } from "@/app/utils/agentDatabaseTools";

export const general: AgentConfig = {
    name: "general",
    publicDescription: "Your general wellbeing assistant. I can help you track habits, manage rewards, and provide encouragement.",
    instructions: `
# Personality and Tone
You're Wei, a friendly, motivating, and supportive wellbeing assistant who helps users track their habits, earn points, and redeem rewards. Your personality is warm and encouraging, but also straightforward and helpful. You should be conversational but concise.
... omitted for brevity.
`,
    tools: [
        {
            type: "function",
            name: "getUserData",
            description:
                "Get the user's profile information, habits, completions, rewards, points, streak, and recent activity.",
            parameters: {
                type: "object",
                properties: {},
                required: [],
            },
        },
        {
            type: "function",
            name: "completeHabit",
            description:
                "Mark a habit as complete, award points to the user, and return the updated points balance.",
            parameters: {
                type: "object",
                properties: {
                    habitId: {
                        type: "string",
                        description: "The ID of the habit to complete",
                    },
                },
                required: ["habitId"],
            },
        },
    ],
    toolLogic: {
        getUserData: async () => {
            try {
                const userData = await getUserDataForAgent();
                return userData;
            } catch (error) {
                console.error("Error getting user data for agent:", error);
                return {
                    error: "Failed to retrieve user data. Please try again later."
                };
            }
        },
        completeHabit: async ({ habitId }) => {
            try {
                const result = await completeHabit(habitId);
                return result;
            } catch (error) {
                console.error("Error completing habit:", error);
                return {
                    success: false,
                    message: "Failed to complete habit. Please try again later."
                };
            }
        }
    },
};

export default general;
```


### Reward Manager Agent

This agent is responsible for managing rewards.
It has access to the user's profile information, habits, completions, points, streak, and recent activity.
It can call: `getUserStats`, `getUserRewards`, `getRewardRedemptions`, `redeemReward`.

```ts
import { AgentConfig } from "@/app/types";
import { getUserStats, getUserRewards, getRewardRedemptions } from "@/app/utils/agentDatabaseTools";
import { DATABASE_NAME } from "@/lib/config";
import { DATABASE_VERSION } from "@/lib/config";
import { openDB } from "idb";

const rewardsManager: AgentConfig = {
  name: "rewardsManager",
  publicDescription:
    "Displays available rewards and processes point redemptions.",
  instructions: `
# Personality and Tone
## Identity
You\'re Wei\'s cheerful curator—fun-loving, a bit mischievous, who makes rewards feel special.
... omitted for brevity.
`,
  tools: [
    {
      type: "function",
      name: "getUserStats",
      description: "Get the user's current points balance and streak information",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      type: "function",
      name: "getUserRewards",
      description: "Get the list of rewards available to the user",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      type: "function",
      name: "getRewardRedemptions",
      description: "Get the user's past reward redemptions",
      parameters: {
        type: "object",
        properties: {
          daysAgo: {
            type: "number",
            description: "Get redemptions from this many days ago (default 30)",
          },
        },
        required: [],
      },
    },
    {
      type: "function",
      name: "redeemReward",
      description: "Redeem a reward for the user, deducting points from their balance",
      parameters: {
        type: "object",
        properties: {
          rewardId: {
            type: "string",
            description: "The ID of the reward to redeem",
          },
        },
        required: ["rewardId"],
      },
    },
  ],
  toolLogic: {
    getUserStats: async () => {
      try {
        const stats = await getUserStats();
        return stats;
      } catch (error) {
        console.error("Error getting user stats:", error);
        return { error: "Failed to retrieve user stats" };
      }
    },
    getUserRewards: async () => {
      try {
        const rewards = await getUserRewards();
        return { rewards };
      } catch (error) {
        console.error("Error getting user rewards:", error);
        return { error: "Failed to retrieve rewards" };
      }
    },
    getRewardRedemptions: async ({ daysAgo = 30 }) => {
      try {
        const redemptions = await getRewardRedemptions(daysAgo);
        return { redemptions };
      } catch (error) {
        console.error("Error getting reward redemptions:", error);
        return { error: "Failed to retrieve reward redemptions" };
      }
    },
    redeemReward: async ({ rewardId }) => {
      try {
        // We need to use the database context directly since redeemReward isn't exported
        // First get the database from the context
        const db = await openDB(DATABASE_NAME, DATABASE_VERSION);
        
        // Get the reward details
        const reward = await db.get('rewards', rewardId);
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
          rewardId,
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
        console.error("Error redeeming reward:", error);
        return { success: false, message: "Failed to redeem reward" };
      }
    },
  },
};

export default rewardsManager;
```

> file location: `app/agentConfigs/wellbeing/rewards-manager.ts`


### Points Calculator Agent

This agent is responsible for calculating points.
It has access to the user's profile information, habits, completions, points, streak, and recent activity.
It can call: `getUserStats`, `getHabitCompletions`, `calculateBonusPoints`.
Returns: *basePoints*, *chainBonus*, *streakBonus*, *consistencyBonus*, *totalBonus*, *totalPoints*, *explanation*: `${basePoints} base + ${chainBonus} chain + ${streakBonus} streak + ${consistencyBonus} consistency = ${totalPoints} total`.

```ts
import { AgentConfig } from "@/app/types";
import { getUserStats, getHabitCompletions } from "@/app/utils/agentDatabaseTools";

const pointsCalculator: AgentConfig = {
    name: "pointsCalculator",
    publicDescription:
      "Handles computing bonus points (chain, load, gradient) on top of the base award.",
    instructions:
      `
      # Personality and Tone
      ... omitted for brevity.
`,
    tools: [
      {
        type: "function",
        name: "getUserStats",
        description: "Get the user's current points balance and streak information",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        type: "function",
        name: "getHabitCompletions",
        description: "Get the user's habit completion history for calculating bonuses",
        parameters: {
          type: "object",
          properties: {
            daysAgo: {
              type: "number",
              description: "Get completions from this many days ago (default 30)",
            },
          },
          required: [],
        },
      },
      {
        type: "function",
        name: "calculateBonusPoints",
        description: "Calculate bonus points based on streak, consistency, and habit difficulty",
        parameters: {
          type: "object",
          properties: {
            habitId: {
              type: "string",
              description: "The ID of the habit to calculate bonuses for",
            },
            basePoints: {
              type: "number",
              description: "The base points awarded for this habit",
            },
          },
          required: ["habitId", "basePoints"],
        },
      },
    ],
    toolLogic: {
      getUserStats: async () => {
        try {
          const stats = await getUserStats();
          return stats;
        } catch (error) {
          console.error("Error getting user stats:", error);
          return { error: "Failed to retrieve user stats" };
        }
      },
      getHabitCompletions: async ({ daysAgo = 30 }) => {
        try {
          const completions = await getHabitCompletions(daysAgo);
          return { completions };
        } catch (error) {
          console.error("Error getting habit completions:", error);
          return { error: "Failed to retrieve habit completions" };
        }
      },
      calculateBonusPoints: async ({ habitId, basePoints }) => {
        try {
          // Get user's habit completions to calculate streaks and consistency
          const completions = await getHabitCompletions(30);
          
          // Filter completions for this specific habit
          const habitCompletions = completions.filter(
            completion => completion.habitId === habitId
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
          const totalPoints = basePoints + totalBonus;
          
          return {
            basePoints,
            chainBonus,
            streakBonus,
            consistencyBonus,
            totalBonus,
            totalPoints,
            explanation: `${basePoints} base + ${chainBonus} chain + ${streakBonus} streak + ${consistencyBonus} consistency = ${totalPoints} total`
          };
        } catch (error) {
          console.error("Error calculating bonus points:", error);
          return { 
            error: "Failed to calculate bonus points",
            basePoints,
            totalPoints: basePoints
          };
        }
      }
    },
  };

export default pointsCalculator;
```

> file location: `app/agentConfigs/wellbeing/points-calculator.ts`

### Habit Manager Agent

This agent is responsible for managing habits.
It has access to the user's profile information, habits, completions, points, streak, and recent activity.
It can call: `getUserHabits`, `getHabitCompletions`, `completeHabit`.

```ts
import { AgentConfig } from "@/app/types";
import { getUserHabits, getHabitCompletions, completeHabit } from "@/app/utils/agentDatabaseTools";

const habitTracker: AgentConfig = {
  name: "habitTracker",
  publicDescription:
    "Logs user activities and awards base points for each habit.",
  instructions:
    `# Personality and Tone
## Identity
You\'re Wei\'s meticulous assistant—calm, precise, and detail-oriented—dedicated to tracking every healthy choice the user makes.
... omitted for brevity.
`,
  tools: [
    {
      type: "function",
      name: "getUserHabits",
      description: "Get the list of habits the user has created",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      type: "function",
      name: "getHabitCompletions",
      description: "Get the list of habit completions for the past X days",
      parameters: {
        type: "object",
        properties: {
          daysAgo: {
            type: "number",
            description: "Get completions from this many days ago (default 30)",
          },
        },
        required: [],
      },
    },
    {
      type: "function",
      name: "completeHabit",
      description: "Mark a habit as complete and award points to the user",
      parameters: {
        type: "object",
        properties: {
          habitId: {
            type: "string",
            description: "The ID of the habit to mark as complete",
          },
        },
        required: ["habitId"],
      },
    },
  ],
  toolLogic: {
    getUserHabits: async () => {
      try {
        const habits = await getUserHabits();
        return { habits };
      } catch (error) {
        console.error("Error getting user habits:", error);
        return { error: "Failed to retrieve habits" };
      }
    },
    getHabitCompletions: async ({ daysAgo = 30 }) => {
      try {
        const completions = await getHabitCompletions(daysAgo);
        return { completions };
      } catch (error) {
        console.error("Error getting habit completions:", error);
        return { error: "Failed to retrieve habit completions" };
      }
    },
    completeHabit: async ({ habitId }) => {
      try {
        const result = await completeHabit(habitId);
        return result;
      } catch (error) {
        console.error("Error completing habit:", error);
        return { success: false, message: "Failed to complete habit" };
      }
    },
  },
};

export default habitTracker;
```

> file location: `app/agentConfigs/wellbeing/habit-tracker.ts`

### Simple User Agent

This agent is responsible for providing users with information about their data.
It can transfer control to the rest of the agents.

```ts
import { AgentConfig } from "@/app/types";

/**
 * This agent specializes in providing users with information about their data
 * It can answer questions about points, habits, streaks, etc.
 */
const userDataAgent: AgentConfig = {
  name: "user-data-agent",
  publicDescription: "Helps users understand their data, points, habits, and rewards",
  instructions: `You are Wei's user data specialist. Your primary role is to help users access and understand their data.
  ... omitted for brevity.
`,
  tools: [],
};

export default userDataAgent; 
```

> file location: `app/agentConfigs/wellbeing/user-data-agent.ts`

### Transfer rules

Set up the transfer relationships between agents. 
Then apply transfer tools to all agents.

```ts
import rewardsManager from "./rewards-manager";
import pointsCalculator from "./points-calculator";
import habitTracker from "./habit-tracker";
import userDataAgent from "./user-data-agent";
import { injectTransferTools } from "../utils";

// Set up the transfer relationships between agents
rewardsManager.downstreamAgents = [pointsCalculator, habitTracker, userDataAgent];
pointsCalculator.downstreamAgents = [rewardsManager, habitTracker, userDataAgent];
habitTracker.downstreamAgents = [rewardsManager, pointsCalculator, userDataAgent];
userDataAgent.downstreamAgents = [rewardsManager, pointsCalculator, habitTracker];

// Apply transfer tools to all agents
const agents = injectTransferTools([
  rewardsManager,
  pointsCalculator,
  habitTracker,
  userDataAgent,
]);

export default agents;
```

> file location: `app/agentConfigs/wellbeing/index.ts`

### All agents

We need to export all agents to be used in the app.
Set wellbeing as the default agent set since it contains our user data agent.

```ts
import { AllAgentConfigsType } from "@/app/types";
import greeter from "./greeter";
import wellbeing from "./wellbeing";

export const allAgentSets: AllAgentConfigsType = {
  wellbeing,
  greeter,
};

// Set wellbeing as the default agent set since it contains our user data agent
export const defaultAgentSetKey = "wellbeing";
```

> file location: `app/agentConfigs/index.ts`


### Comprehensive Agents Logic

We need to inject the transfer tools to all agents.
`injectTransferTools` defines and adds "transferAgents" tool dynamically based on the specified downstreamAgents on each agent.

```ts
import { AgentConfig, Tool } from "@/app/types";
import { UserCache } from "@/app/contexts/UserCacheContext";

/**
 * This defines and adds "transferAgents" tool dynamically based on the specified downstreamAgents on each agent.
 */
export function injectTransferTools(agentDefs: AgentConfig[]): AgentConfig[] {
  // Iterate over each agent definition
  agentDefs.forEach((agentDef) => {
    const downstreamAgents = agentDef.downstreamAgents || [];

    // Only proceed if there are downstream agents
    if (downstreamAgents.length > 0) {
      // Build a list of downstream agents and their descriptions for the prompt
      const availableAgentsList = downstreamAgents
        .map(
          (dAgent) =>
            `- ${dAgent.name}: ${dAgent.publicDescription ?? "No description"}`
        )
        .join("\n");

      // Create the transfer_agent tool specific to this agent
      const transferAgentTool: Tool = {
        type: "function",
        name: "transferAgents",
        description: `Triggers a transfer of the user to a more specialized agent. 
  Calls escalate to a more specialized LLM agent or to a human agent, with additional context. 
  Only call this function if one of the available agents is appropriate. Don't transfer to your own agent type.
  
  Let the user know you're about to transfer them before doing so.
  
  Available Agents:
  ${availableAgentsList}
        `,
        parameters: {
          type: "object",
          properties: {
            rationale_for_transfer: {
              type: "string",
              description: "The reasoning why this transfer is needed.",
            },
            conversation_context: {
              type: "string",
              description:
                "Relevant context from the conversation that will help the recipient perform the correct action.",
            },
            destination_agent: {
              type: "string",
              description:
                "The more specialized destination_agent that should handle the user's intended request.",
              enum: downstreamAgents.map((dAgent) => dAgent.name),
            },
          },
          required: [
            "rationale_for_transfer",
            "conversation_context",
            "destination_agent",
          ],
        },
      };

      // Ensure the agent has a tools array
      if (!agentDef.tools) {
        agentDef.tools = [];
      }

      // Add the newly created tool to the current agent's tools
      agentDef.tools.push(transferAgentTool);
    }

    // so .stringify doesn't break with circular dependencies
    agentDef.downstreamAgents = agentDef.downstreamAgents?.map(
      ({ name, publicDescription }) => ({
        name,
        publicDescription,
      })
    );
  });

  return agentDefs;
}
```

> file location: `app/agentConfigs/utils.ts`

#### Inject user context

Enhances agent instructions with user data from cache. 
This allows agents to have personalized context about the user. 
Also adds user data access tools to the agent

```ts
/**
 * Enhances agent instructions with user data from cache
 * This allows agents to have personalized context about the user
 * Also adds user data access tools to the agent
 */
export function injectUserContext(agentDef: AgentConfig, userCache: UserCache): AgentConfig {
  // Create a deep copy to avoid mutating the original
  const enhancedAgent = { ...agentDef };
  
  if (!userCache) {
    return enhancedAgent;
  }
  
  // Create a user context section to append to instructions
  const userContextBlock = createUserContextBlock(userCache);
  
  // Append the user context to the agent's instructions
  if (enhancedAgent.instructions) {
    enhancedAgent.instructions = `${enhancedAgent.instructions}\n\n# User Context\n${userContextBlock}`;
  }
  
  // Add user data access tools
  const userDataTools = createUserDataTools();
  
  // Ensure the agent has a tools array
  if (!enhancedAgent.tools) {
    enhancedAgent.tools = [];
  }
  
  // Add user data tools to the agent's tools
  enhancedAgent.tools.push(...userDataTools);
  
  return enhancedAgent;
}
```

> file location: `app/agentConfigs/utils.ts`

#### Create user context block

Creates a formatted block of user context from cache data.
Optimized to provide concise but useful information.

```ts
/**
 * Creates a formatted block of user context from cache data
 * Optimized to provide concise but useful information
 */
function createUserContextBlock(userCache: UserCache): string {
  if (!userCache) {
    return "No user data available.";
  }
  
  let contextBlock = '';
  
  // Add user profile information
  if (userCache.profile) {
    contextBlock += `## User Profile\n`;
    contextBlock += `- Name: ${userCache.profile.name || 'Unknown'}\n`;
    if (userCache.profile.bio) contextBlock += `- Bio: ${userCache.profile.bio}\n`;
    contextBlock += `- Member since: ${userCache.profile.joinDate || 'Unknown'}\n\n`;
  }
  
  // Add points and streak information (most frequently asked)
  contextBlock += `## Summary Stats\n`;
  contextBlock += `- Current points: ${userCache.points || 0}\n`;
  contextBlock += `- Current streak: ${userCache.streak || 0} days\n`;
  
  // Add habit count and category summary (not full details)
  if (userCache.habits && userCache.habits.length > 0) {
    const habitCategories = userCache.habits.reduce((acc: Record<string, number>, habit: any) => {
      const category = habit.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    contextBlock += `- Active habits: ${userCache.habits.length} habits\n`;
    contextBlock += `- Categories: ${Object.entries(habitCategories).map(([cat, count]) => `${cat} (${count})`).join(', ')}\n\n`;
  }
  
  // Add just 2-3 recent activities as examples (not all)
  if (userCache.recentActivity && userCache.recentActivity.length > 0) {
    contextBlock += `## Recent Activity Examples\n`;
    userCache.recentActivity.slice(0, 3).forEach((activity: any) => {
      contextBlock += `- ${activity.action} "${activity.target}" (${activity.points > 0 ? '+' : ''}${activity.points} points) on ${activity.date}\n`;
    });
    contextBlock += '\n';
  }
  
  // Add note about available tools
  contextBlock += `*Note: For detailed user information, use the provided user data access functions.*\n`;
  
  return contextBlock;
}
```

> file location: `app/agentConfigs/utils.ts`

#### Create user data tools

Creates a set of tools that allow the agent to access specific user data.
Note: The actual implementation of these tools is in the API route handler. 
Here: `app/api/chat/completions/route.ts`.

```ts
/**
 * Creates a set of tools that allow the agent to access specific user data
 * Note: The actual implementation of these tools is in the API route handler
 */
function createUserDataTools(): Tool[] {
  // Prepare the tools array
  const tools: Tool[] = [];
  
  // Get user profile info
  const getUserProfileTool: Tool = {
    type: "function",
    name: "getUserProfile",
    description: "Get detailed user profile information",
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
  };
  tools.push(getUserProfileTool);
  
  // Get user points and streak
  const getUserStatsTool: Tool = {
    type: "function",
    name: "getUserStats",
    description: "Get user's current points and streak information",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  };
  tools.push(getUserStatsTool);
  
  // Get user habits
  const getUserHabitsTool: Tool = {
    type: "function",
    name: "getUserHabits",
    description: "Get list of user's active habits with details",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Optional category to filter habits by"
        }
      },
      required: []
    }
  };
  tools.push(getUserHabitsTool);
  
  // Get user recent activity
  const getUserActivityTool: Tool = {
    type: "function",
    name: "getRecentActivity",
    description: "Get user's recent activity history",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of activities to return (defaults to 5)"
        },
        activityType: {
          type: "string",
          description: "Filter by activity type ('Completed' or 'Redeemed')"
        }
      },
      required: []
    }
  };
  tools.push(getUserActivityTool);
  
  // Get user rewards
  const getUserRewardsTool: Tool = {
    type: "function",
    name: "getUserRewards",
    description: "Get user's available rewards",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  };
  tools.push(getUserRewardsTool);
  
  // Get reward redemptions
  const getRewardRedemptionsTool: Tool = {
    type: "function",
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
  };
  tools.push(getRewardRedemptionsTool);
  
  return tools;
}
```

> file location: `app/agentConfigs/utils.ts`

Congratulations! You've just created a comprehensive agents logic for Wei.

## API

We need to build the API to handle the agent logic.

Create a new file `app/api/chat/completions/route.ts`.


### Default functions

Define default functions that all AI Agents can access.

```ts
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
```

> file location: `app/api/chat/completions/route.ts`

### API route handler

[POST request]: Handle the API request from the client.

```ts
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
```

If you noticed above, we're using user's cached data. 
Since IndexedBD is client side, we need to handle the data differently.
Otherwise, for example Supabase, we'd simple use edge functions to fetch the data.

> file location: `app/api/chat/completions/route.ts`

### Handle function calls

Handle function calls using cached data.

```ts
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
```

> file location: `app/api/chat/completions/route.ts`

### Handle database functions

Central handler for all database functions with user cache.

```ts
async function handleDatabaseFunction(name: string, args: any, userCache: any) {
  switch (name) {
    case "getUserProfile":
      // Return the user profile with optional field filtering
      if (args.fields && Array.isArray(args.fields) && args.fields.length > 0) {
        const filteredProfile: Record<string, any> = {};
        for (const field of args.fields) {
          if (userCache.profile && userCache.profile[field] !== undefined) {
            filteredProfile[field] = userCache.profile[field];
          }
        }
        return JSON.stringify(filteredProfile);
      }
      // Return the complete profile if no fields specified
      return JSON.stringify(userCache.profile || { name: "Unknown User" });

    case "getUserHabits":
      // Filter habits by category if specified
      if (args.category && userCache.habits) {
        const filteredHabits = userCache.habits.filter((habit: any) => habit.category === args.category);
        return JSON.stringify({
          habits: filteredHabits,
          count: filteredHabits.length
        });
      }
      // Return all habits if no category filter
      return JSON.stringify({
        habits: userCache.habits || [],
        count: (userCache.habits || []).length
      });

    case "getHabitCompletions":
      // Get completions from the past X days
      const daysAgo = args.daysAgo || 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      
      // Filter completions by date
      const filteredCompletions = userCache.completions
        ? userCache.completions.filter(
            (completion: any) => new Date(completion.completedAt) >= cutoffDate
          )
        : [];
      
      return JSON.stringify({
        completions: filteredCompletions,
        count: filteredCompletions.length
      });

    case "getUserStats":
      // Return points and streak
      return JSON.stringify({
        points: userCache.points || 0,
        streak: userCache.streak || 0
      });

    case "getUserRewards":
      // Return all rewards
      return JSON.stringify({
        rewards: userCache.rewards || [],
        count: (userCache.rewards || []).length
      });

    case "getRewardRedemptions":
      // Get redemptions from the past X days
      const redemptionDaysAgo = args.daysAgo || 30;
      const redemptionCutoffDate = new Date();
      redemptionCutoffDate.setDate(redemptionCutoffDate.getDate() - redemptionDaysAgo);
      
      // Filter redemptions by date
      const filteredRedemptions = userCache.redemptions
        ? userCache.redemptions.filter(
            (redemption: any) => new Date(redemption.redeemedAt) >= redemptionCutoffDate
          )
        : [];
      
      return JSON.stringify({
        redemptions: filteredRedemptions,
        count: filteredRedemptions.length
      });

    case "getRecentActivity":
      // Get recent activity with optional filtering
      let activities = userCache.recentActivity || [];
      const limit = args.limit || 5;
      
      // Filter by activity type if provided
      if (args.activityType) {
        activities = activities.filter((activity: any) => activity.action === args.activityType);
      }
      
      return JSON.stringify({
        activities: activities.slice(0, limit),
        count: activities.length
      });

    case "completeHabit":
      // This would normally update the database, but in this context
      // we're just returning a success message since we can't modify the DB from here
      return JSON.stringify({
        success: true,
        message: "Habit marked as complete (simulation only, database not updated)"
      });

    case "redeemReward":
      // This would normally update the database, but in this context
      // we're just returning a success message since we can't modify the DB from here
      return JSON.stringify({
        success: true,
        message: "Reward redeemed (simulation only, database not updated)"
      });

    case "calculateBonusPoints":
      // Get the habit from cache
      const habit = userCache.habits
        ? userCache.habits.find((h: any) => h.id === args.habitId)
        : null;
      
      if (!habit) {
        return JSON.stringify({
          error: "Habit not found",
          bonusPoints: 0
        });
      }
      
      // Calculate a simple bonus based on streak
      const streakBonus = Math.min(50, Math.floor(userCache.streak / 2));
      const difficultyBonus = habit.difficulty ? (habit.difficulty * 5) : 0;
      const totalBonus = streakBonus + difficultyBonus;
      
      return JSON.stringify({
        basePoints: args.basePoints,
        streakBonus,
        difficultyBonus, 
        totalBonus,
        totalPoints: args.basePoints + totalBonus
      });

    default:
      return JSON.stringify({
        error: `Unknown function: ${name}`,
        message: "This function is not supported."
      });
  }
}
```

> file location: `app/api/chat/completions/route.ts`

We're pretty done with the API.

## Building the WEI AI Agent

The very first thing we need to import all UI components.
`shadcn/ui`, `motion-primitives`, and `prompt-kit`.
To do this, run this command in your terminal:

```bash
npx shadcn@latest add --all
```

this will add all the shadcn/ui components to the `components/ui/` folder.

```bash
npx shadcn@latest add --all
```

then add `motion-primitives`.
first install `motion` itself.

```bash
npm install motion
```

now we can start adding components one-by-one.

```bash
npx motion-primitives@latest add text-effect text-shimmer glow-effect
```

...and etc.

similar with `prompt-kit`.
we can install prompt-kit components using the shadcn CLI.

```bash
npx shadcn@latest add "https://prompt-kit.com/c/[COMPONENT].json"
```

### Chat Interface

The chat interface is the main component that will handle the chat messages, input, and history.

Create a new file `app/components/chat/ChatInterface.tsx`.

import all the necessary components.

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useChat } from "@/app/contexts/ChatContext";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatMessage from "./ChatMessage";
import ChatHistory from "./ChatHistory";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ChatInput } from "../chat-input/chat-input";
import { ArrowLeft, ListMagnifyingGlass, PencilSimpleLine } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
```

initialize the chat interface, state variables, and router.

```tsx

interface ChatInterfaceProps {}

export default function ChatInterface({ }: ChatInterfaceProps) {
  const { messages, isTyping, sendMessage, clearMessages, loadConversation, currentConversationId } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
```

add useEffect to scroll to the bottom when new messages are added.

```tsx
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
    }
  };
```

define a function to load old conversations from database.
`loadConversation()` comes from `useChat` hook, which is provided by `ChatContext`, `ChatProvider`.

```tsx
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
```

define the UI.
we're using `Drawer` to give the user nice conversation history experience.
and separate `ChatInput` component to handle the multi-functional chat input.

```tsx
  return (
    <Card className={`flex gap-4 bg-transparent border-none shadow-none flex-col p-2 h-[100dvh]`}>
      <CardHeader className="pb-0 pt-0 px-0 border-b border-border [.border-b]:pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              title="Back to dashboard"
            >
              <ArrowLeft className="size-4" />
            </Button>
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
                  <ListMagnifyingGlass className="size-4" />
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
              <PencilSimpleLine className="size-4" />
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
              <span className="text-sm text-muted-foreground">
                <TextShimmer>
                  Wei is typing...
                </TextShimmer>
              </span>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <CardFooter className="pt-0 px-0 w-full">
        <ChatInput
          value={inputValue}
          onValueChange={setInputValue}
          onSend={handleSendMessage}
          isSubmitting={isSending}
          files={[]}
          onFileUpload={() => {}}
          onFileRemove={() => {}}
          stop={() => {}}
          status={isSending ? "submitted" : "ready"}
          connected={true}
          partnerDisconnected={false}
        />
      </CardFooter>
    </Card>
  );
} 
```

### Chat Input

The chat input is a component that handles the multi-functional chat input.

Create a new file `app/components/chat-input/chat-input.tsx`.

import all the necessary components.

```tsx
"use client"

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "@phosphor-icons/react/dist/ssr"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { ButtonFileUpload } from "./button-file-upload"
import { ButtonVideoChat } from "./button-video-chat"
import { FileList } from "./file-list"
import { ButtonEmojiPicker } from "./button-emoji-picker"
import { ButtonGifPicker } from "./button-gif-picker"
import { toast } from "sonner"
import { Stop } from "@phosphor-icons/react"
import { ButtonRecord } from "./button-record"
```

define the chat input props.

```tsx
type ChatInputProps = {
  value: string
  onValueChange: (value: string) => void
  onSend: () => void
  isSubmitting?: boolean
  files: File[]
  onFileUpload: (files: File[]) => void
  onFileRemove: (file: File) => void
  stop: () => void
  status?: "submitted" | "streaming" | "ready" | "error"
  connected?: boolean
  partnerDisconnected?: boolean
}
```

define the chat input component.

```tsx
export function ChatInput({
  value,
  onValueChange,
  onSend,
  isSubmitting,
  files,
  onFileUpload,
  onFileRemove,
  stop,
  status,
  connected = true,
  partnerDisconnected = false,
}: ChatInputProps) {
  
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Textarea auto-resize
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    };
    
    textarea.addEventListener('input', adjustHeight);
    
    return () => {
      textarea.removeEventListener('input', adjustHeight);
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isSubmitting) return

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        onSend()
      }
    },
    [onSend, isSubmitting]
  )

  const handleInputChange = (newValue: string) => {
    if (pendingAttachment) return; // Disable text input if image is selected
    
    if (newValue.length > 1000) {
      toast("Message too long", { 
        description: "Please keep your message under 1000 characters.",
        duration: 2000,
      });
      return;
    }
    
    onValueChange(newValue);
  };

  const handleMainButtonClick = () => {
    if (isSubmitting && status !== "streaming") {
      return;
    }

    if (isSubmitting && status === "streaming") {
      stop();
      return;
    }

    onSend();
  };

  return (
    <>
      <div className="w-full relative order-2 px-0 sm:px-0 pb-0 md:order-1">
        <PromptInput
          className={`rounded-xl border-input bg-card/80 relative z-10 overflow-hidden border p-0 pb-2 shadow-xs backdrop-blur-xl`}
          maxHeight={200}
          value={value}
          onValueChange={handleInputChange}
        >
          <FileList files={files} onFileRemove={onFileRemove} />
          <PromptInputTextarea
            placeholder={connected ? (files.length > 0 ? "Image selected. Click send to share it." : "Type a message...") : "Connect to start chatting..."}
            onKeyDown={handleKeyDown}
            className="mt-2 ml-2 min-h-[44px] max-h-[150px] text-sm leading-[1.3] sm:text-sm md:text-sm placeholder:text-sm"
            disabled={isSubmitting || files.length > 0 || pendingAttachment !== null}
            ref={textareaRef}
          />
          <PromptInputActions className="mt-1 w-full justify-between px-2">
            <div className="flex gap-2">
              {/* File Upload */}
              {/* Emoji Picker */}
              {/* GIF Picker */}
            </div>
            <div className="flex gap-2">
              {/* Video Chat Button */}
              {/* Record Button */}
              {/* Send Message Button */}
              <PromptInputAction
                tooltip={isSubmitting ? "Stop generating" : (value.length > 0 || files.length > 0 ? "Send message" : "Enter a message")}
              >
                <Button
                  variant="default"
                  size="icon"
                  className={`size-8 rounded-lg transition-all duration-300 ease-out ${isSubmitting && "cursor-wait"} ${(value.length > 0 || files.length > 0) ? "cursor-pointer" : "cursor-not-allowed"}`}
                  onClick={handleMainButtonClick}
                  disabled={!(value.length > 0 || files.length > 0) || !connected || partnerDisconnected || (isSubmitting && status !== "streaming")}
                  type="button"
                  aria-label={isSubmitting && status === "streaming" ? "Stop generating" : "Send message"}
                >
                  {isSubmitting && status === "streaming" ? (
                    <Stop className="size-4" weight="fill"/>
                  ) : (
                    <ArrowUp className="size-4" />
                  )}
                </Button>
              </PromptInputAction>
            </div>
          </PromptInputActions>
        </PromptInput>
      </div>
    </>
  )
}
```

#### Further Enhancements (Chat Input)

you may further enhance chat input actions.

for example sending emojis and gifs. 
put after the file upload button.

```tsx

// functions

const handleEmojiClick = (emoji: string) => {
    console.log("Handling emoji click in ChatInput:", emoji);
    if (pendingAttachment) {
      console.log("Ignoring emoji - pending attachment exists");
      return; // Disable emoji if image is selected
    }
    
    try {
      // Get current cursor position
      const cursorPosition = textareaRef.current?.selectionStart || value.length;
      const newValue = value.slice(0, cursorPosition) + emoji + value.slice(cursorPosition);
      
      // Update value
      onValueChange(newValue);
      
      // Focus the textarea and set cursor position after the inserted emoji
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPosition = cursorPosition + emoji.length;
          textareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 10);
    } catch (error) {
      console.error("Error inserting emoji:", error);
    }
  };

  const handleGifSelect = (gif: any) => {
    // Fetch the GIF as a blob
    fetch(gif.images.original.url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch GIF: ${response.status} ${response.statusText}`);
        }
        return response.blob();
      })
      .then(blob => {
        // Convert blob to file
        const file = new File([blob], `giphy-${gif.id}.gif`, { type: 'image/gif' });
        onFileUpload([file]);
        
        toast.success(
          "GIF selected", {
          description: "GIF ready to send. Click send to share it.",
          duration: 2000,
        });
      })
      .catch(error => {
        toast.error("Failed to load GIF", {
          description: "Please try another one.",
        });
      });
  };

  // UI

  {/* Emoji Picker */}
  <div>
    <ButtonEmojiPicker
      onEmojiSelect={(emoji) => {
        console.log("Emoji selected in chat input:", emoji);
        toast.info("Emoji picker is Premium feature");
        // handleEmojiClick(emoji);
      }}
      disabled={isSubmitting && status === "submitted"}
    />
  </div>
  
  {/* GIF Picker */}
  <div>
    <ButtonGifPicker
      onGifSelect={(gif) => {
        console.log("GIF selected in chat input:", gif.id);
        toast.info("GIF picker is Premium feature");
        // handleGifSelect(gif);
      }}
      disabled={isSubmitting && status === "submitted"}
    />
  </div>
```

for example: real time video streaming with AI Agents.
or audio recording and transcription feature.

```tsx
  import { useVideoChat } from "../video-chat/video-chat-provider" 

  const { startVideoChat, isVideoChatActive } = useVideoChat();

  const handleStartVideoChat = () => {
    if (!connected || partnerDisconnected) {
      toast.error("Cannot start video chat", {
        description: "You need to be connected to start a video chat.",
      });
      return;
    }

    if (!partnerId) {
      toast.error("Cannot start video chat", {
        description: "No partner available for video chat.",
      });
      return;
    }

    // Start the video chat with partner info
    startVideoChat(
      partnerId, 
      partnerUsername || "Partner", 
      isGroupChat, 
      groupCode
    );
    
    toast.info("Starting video chat", {
      description: "Connecting to peer...",
    });
  };

  // UI
    {/* Video Chat Button */}
  <div>
    <ButtonVideoChat
      onStartVideoChat={() => {
        toast.info("Video chat is Premium feature");
      }}
      disabled={!connected || partnerDisconnected}
    />
  </div>

  {/* Record Button */}
  <div>
    <ButtonRecord
      onStartRecord={() => {
        toast.info("Record is Premium feature");
      }}
      onStopRecord={() => {
        toast.info("Record is Premium feature");
      }}
      isPTTUserSpeaking={false}
      isConnected={connected}
      disabled={!connected || partnerDisconnected}
    />
  </div>
```

reply to previoes messages:

```tsx
  // Display reply feedback in the input
  useEffect(() => {
    if (currentReplyTo !== undefined && textareaRef.current) {
      textareaRef.current.placeholder = "Type your reply...";
      textareaRef.current.focus();
    }
  }, [currentReplyTo]);

const handleCancelReply = () => {
    if (setReplyTo) {
      setReplyTo(undefined);
    }
  };
```

add file upload feature.
for example: reports from smart watches, etc.

```tsx
  // Helper to validate image file types
  const isValidImageFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  };

  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null);
  const [pendingAttachmentUrl, setPendingAttachmentUrl] = useState<string | null>(null);
  
  // Reset pending attachment when files are cleared
  useEffect(() => {
    if (files.length === 0 && pendingAttachment !== null) {
      setPendingAttachment(null);
      if (pendingAttachmentUrl) {
        URL.revokeObjectURL(pendingAttachmentUrl);
        setPendingAttachmentUrl(null);
      }
    }
  }, [files.length, pendingAttachment, pendingAttachmentUrl]);
  
  // Additional effect to reset pending attachment when status changes to ready
  useEffect(() => {
    if (status === "ready" && !isSubmitting && pendingAttachment !== null) {
      setPendingAttachment(null);
      if (pendingAttachmentUrl) {
        URL.revokeObjectURL(pendingAttachmentUrl);
        setPendingAttachmentUrl(null);
      }
    }
  }, [status, isSubmitting, pendingAttachment, pendingAttachmentUrl]);

  // Helper function to read file as ArrayBuffer for sending images
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject("Failed to read file as ArrayBuffer.");
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUploadInternal = (files: File[]) => {
    const file = files[0] || null;
    if (!file) return;

    // we support only image files for now
    if (!isValidImageFile(file)) {
      toast.error("Invalid file type", {
        description: "Only JPG, PNG, GIF, and WEBP files are supported.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Maximum file size is 5MB.",
      });
      return;
    }

    setPendingAttachment(file);
    setPendingAttachmentUrl(URL.createObjectURL(file));
    onFileUpload(files);
  };

  // UI
  {/* File Upload */}
  <div>
    <ButtonFileUpload
      onFileUpload={() => {
        console.log("File upload in chat input");
        toast.info("File upload is Premium feature");
        // handleFileUploadInternal
      }}
      disabled={isSubmitting || !connected || partnerDisconnected || files.length > 0}
    />
  </div>
```

### Chat Provider

This context is used to interact with the chat.
It's used to get the messages, send messages, etc.

create a new file `app/contexts/ChatContext.tsx`.

```tsx
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useDatabase } from './DatabaseContext';
import { useUserCache } from './UserCacheContext';

interface Message {
  id: string;
  sender: 'user' | 'wei';
  content: string;
  timestamp: Date;
}

// Define the OpenAI message format
interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatContextType {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  getWeiResponse: (content: string, agentName?: string) => Promise<void>;
  loadConversation: (conversationMessages: Message[], conversationId?: string) => void;
  currentConversationId: string | null;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Helper function to convert our Message[] format to OpenAI's expected format
const formatMessagesForAPI = (messages: Array<Message | { role: string; content: string }>): OpenAIMessage[] => {
  return messages.map(msg => {
    if ('sender' in msg) {
      // Convert our Message format to OpenAI format
      return {
        role: msg.sender === 'wei' ? 'assistant' : 'user',
        content: msg.content
      };
    } else {
      // Already in the expected format
      return msg as OpenAIMessage;
    }
  });
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { saveConversation, getConversations } = useDatabase();
  const { cache, refreshCache } = useUserCache();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [pendingUserMessage, setPendingUserMessage] = useState<Message | null>(null);

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

  const saveCurrentConversation = useCallback(async () => {
    if (messages.length <= 1) return; // Don't save if only welcome message exists
    
    try {
      if (currentConversationId) {
        // Update existing conversation
        await saveConversation(messages, currentConversationId);
      } else {
        // Create new conversation
        const newId = await saveConversation(messages);
        setCurrentConversationId(newId);
      }
    } catch (err) {
      console.error('Error saving conversation:', err);
    }
  }, [messages, currentConversationId, saveConversation]);

  // Save conversation whenever messages change (but after the initial welcome message)
  useEffect(() => {
    if (messages.length > 1) {
      saveCurrentConversation();
    }
  }, [messages.length, saveCurrentConversation]);

  const getWeiResponse = useCallback(async (content: string, agentName?: string) => {
    setIsTyping(true);
    setError(null);
    
    try {
      // Refresh the cache to ensure we have the latest data
      await refreshCache();

      // Get the current messages from state
      const currentMessages = [...messages];
      
      // Format messages for the API
      const formattedMessages = formatMessagesForAPI(currentMessages);

      // Get the agent config if specified
      let functions;
      if (agentName) {
        try {
          const agentModule = await import(`../agentConfigs/wellbeing/${agentName}`);
          functions = agentModule.default?.functions;
        } catch (err) {
          console.error(`Failed to load agent config: ${agentName}`, err);
        }
      }

      // Create a minimal user context system message if there isn't one already
      let hasSystemMessage = false;
      const updatedMessages = [...formattedMessages];
      
      for (const message of updatedMessages) {
        if (message.role === 'system') {
          hasSystemMessage = true;
          break;
        }
      }
      
      // Add minimal context if no system message exists
      if (!hasSystemMessage && cache) {
        // Create a more descriptive system message with basic user info
        const minimalContext: OpenAIMessage = {
          role: 'system',
          content: `You are Wei, a helpful habit-building assistant. 
The user's name is ${cache.profile?.name || 'User'}.
They currently have ${cache.points || 0} points and a streak of ${cache.streak || 0} days.
They have ${cache.habits?.length || 0} active habits.
Use getUserProfile, getUserStats, getUserHabits and other user data functions to get more details when needed.`
        };
        updatedMessages.unshift(minimalContext);
      }

      // Make the API call - include userCache for function calling
      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: updatedMessages,
          functions,
          userCache: cache // Include userCache for function calls, but keep it minimal in messages
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const newMessage = data.choices[0].message;

      // Create and add the Wei's response message
      const weiResponseMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sender: 'wei',
        content: newMessage.content || '',
        timestamp: new Date()
      };
      
      // Add Wei's response to messages
      setMessages(prev => [...prev, weiResponseMessage]);
    } catch (err) {
      console.error('Error getting response:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsTyping(false);
    }
  }, [messages, refreshCache, cache]);

  const sendMessage = async (content: string) => {
    // Create the user message
    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender: 'user',
      content,
      timestamp: new Date()
    };
    
    // Add user message to messages state directly
    setMessages(prev => [...prev, userMessage]);
    
    // Wait for the state to update before getting Wei's response
    setTimeout(async () => {
      await getWeiResponse(content);
    }, 100);
  };

  const clearMessages = () => {
    // Keep only the welcome message
    const welcomeMessage = messages[0];
    setMessages([welcomeMessage]);
    // Reset the current conversation ID to start a new conversation
    setCurrentConversationId(null);
    // Clear any pending message
    setPendingUserMessage(null);
  };

  const loadConversation = (conversationMessages: Message[], conversationId?: string) => {
    // If there are messages in the conversation, replace current messages
    if (conversationMessages && conversationMessages.length > 0) {
      // Get the first welcome message from current chat
      const welcomeMessage = messages[0];
      
      // Set the welcome message followed by the conversation messages
      setMessages([welcomeMessage, ...conversationMessages]);
      
      // Set the conversation ID if provided
      if (conversationId) {
        setCurrentConversationId(conversationId);
      }
    }
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      isTyping, 
      error, 
      sendMessage, 
      clearMessages,
      getWeiResponse,
      loadConversation,
      currentConversationId
    }}>
      {children}
    </ChatContext.Provider>
  );
}; 
```

### Providers (Chat Provider)

Wrap the app with the `ChatProvider` component. 
Later, we will add more providers to the app.

In order to be able to use the chat provider, we need to wrap our app with the `ChatProvider` component.
basically, it will provide the chat context to the app.

create a new file `app/providers.tsx`.

```tsx
"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { ChatProvider } from "./contexts/ChatContext";
import RealTimeStreamingMode from "./RealTimeStreamingMode";
import { usePathname } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem forcedTheme={pathname === "/" ? undefined : "dark"}>
      <ChatProvider>
        {children}
        {pathname !== "/" && <RealTimeStreamingMode />}
      </ChatProvider>
    </ThemeProvider>
  );
}
```

### Define database schema

This is the schema for the database.
It's used to define the structure of the database.

create a new file `app/types/database.ts`.

```tsx
import { DBSchema } from 'idb';

// Define our database schema
export interface WeiDB extends DBSchema {
  habits: {
    key: string;
    value: {
      id: string;
      name: string;
      category: string;
      points: number;
      frequency: 'daily' | 'weekly' | 'monthly';
      createdAt: Date;
    };
    indexes: { 'by-category': string };
  };
  completions: {
    key: string;
    value: {
      id: string;
      habitId: string;
      completedAt: Date;
      points: number;
    };
    indexes: { 'by-habit': string; 'by-date': Date };
  };
  rewards: {
    key: string;
    value: {
      id: string;
      name: string;
      description: string;
      cost: number;
      createdAt: Date;
    };
  };
  rewardRedemptions: {
    key: string;
    value: {
      id: string;
      rewardId: string;
      redeemedAt: Date;
      cost: number;
    };
  };
  user: {
    key: string;
    value: {
      id: string;
      name: string;
      points: number;
      streakDays: number;
      lastActive: Date;
    };
  };
  conversations: {
    key: string;
    value: {
      id: string;
      messages: {
        id: string;
        sender: 'user' | 'wei';
        content: string;
        timestamp: Date;
      }[];
      createdAt: Date;
      updatedAt?: Date;
    };
  };
  userProfile: {
    key: string;
    value: {
      id: string;
      name: string;
      email: string;
      bio: string;
      avatarUrl: string;
      joinDate: string;
    };
  };
} 
```

### Database Context

This context is used to interact with the database.
It's used to get the user data, habits, completions, rewards, etc.

create a new file `app/contexts/DatabaseContext.tsx`.

```tsx

"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { IDBPDatabase } from 'idb';
import { WeiDB } from '../types/database';
import { seedDatabase } from '../utils/seedData';
import { initDB } from '@/lib/db';

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
  getRewardRedemptions: () => Promise<WeiDB['rewardRedemptions']['value'][]>;
  getUserData: () => Promise<WeiDB['user']['value'] | null>;
  saveConversation: (messages: WeiDB['conversations']['value']['messages'], conversationId?: string) => Promise<string>;
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
    const setupDB = async () => {
      try {
        const database = await initDB();
        setDB(database);
        
        // Load initial user points
        try {
          const userData = await database.get('user', 'default');
          if (userData) {
            setUserPointsState(userData.points);
          }
          
          // Seed database with sample data
          await seedDatabase(database);
        } catch (dataError) {
          console.error('Error getting initial data from database:', dataError);
          // Continue even with this error - we just might not have initial data
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to init database:', err);
        setError(err instanceof Error ? err : new Error('Unknown database error'));
        setIsLoading(false);
      }
    };

    setupDB();
    
    // Do NOT close the connection when unmounting
    // The connection will be shared across providers
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

  const getRewardRedemptions = async () => {
    if (!db) return [];
    return db.getAll('rewardRedemptions');
  };

  const getUserData = async (): Promise<WeiDB['user']['value'] | null> => {
    if (!db) return null;
    const userData = await db.get('user', 'default');
    return userData || null;
  };

  const saveConversation = async (messages: WeiDB['conversations']['value']['messages'], conversationId?: string) => {
    if (!db) throw new Error('Database not initialized');
    
    if (conversationId) {
      // Update existing conversation
      try {
        const existingConversation = await db.get('conversations', conversationId);
        if (existingConversation) {
          await db.put('conversations', {
            ...existingConversation,
            messages,
            updatedAt: new Date()
          });
          return conversationId;
        }
      } catch (error) {
        console.error('Failed to update conversation:', error);
        // If update fails, fall back to creating a new conversation
      }
    }
    
    // Create new conversation
    const id = conversationId || `conversation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      await db.add('conversations', {
        id,
        messages,
        createdAt: new Date()
      });
    } catch (error) {
      // Handle the case where the conversation already exists but we couldn't update it
      console.error('Failed to create conversation:', error);
      if (conversationId) {
        try {
          // Try to overwrite the existing conversation as a last resort
          await db.put('conversations', {
            id,
            messages,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } catch (putError) {
          console.error('Failed to overwrite conversation:', putError);
        }
      }
    }
    
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
    getRewardRedemptions,
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
```

### Providers (Database Context)

Wrap the app with the `DatabaseProvider` component.

open file `app/providers.tsx`.

```tsx
"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { DatabaseProvider } from "./contexts/DatabaseContext";
import { UserCacheProvider } from "./contexts/UserCacheContext";
import { ChatProvider } from "./contexts/ChatContext";
import RealTimeStreamingMode from "./RealTimeStreamingMode";
import { usePathname } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem forcedTheme={pathname === "/" ? undefined : "dark"}>
      <DatabaseProvider>
        <UserCacheProvider>
          <ChatProvider>
            {children}
            {pathname !== "/" && <RealTimeStreamingMode />}
          </ChatProvider>
        </UserCacheProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
} 
```

### User Cache Context

This context is used to cache the user data.
It's used to avoid fetching the user data from the database on every page load.

create a new file `app/contexts/UserCacheContext.tsx`.

```tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { WeiDB } from '../types/database';
import { useDatabase } from './DatabaseContext';

export interface UserCache {
  profile: any;
  habits: any[];
  completions: any[];
  rewards: any[];
  redemptions: any[];
  points: number;
  streak: number;
  recentActivity: any[];
  lastUpdated: Date;
}

interface UserCacheContextType {
  cache: UserCache | null;
  isLoading: boolean;
  error: Error | null;
  refreshCache: () => Promise<void>;
}

const UserCacheContext = createContext<UserCacheContextType | null>(null);

export const useUserCache = () => {
  const context = useContext(UserCacheContext);
  if (!context) {
    throw new Error('useUserCache must be used within a UserCacheProvider');
  }
  return context;
};

export const UserCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db, isLoading: dbLoading } = useDatabase();
  const [cache, setCache] = useState<UserCache | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserData = async () => {
    if (!db) {
      console.warn('UserCacheProvider: Database not available yet');
      return;
    }
    
    setIsLoading(true);
    try {
      // Get user profile
      const profile = await db.get('userProfile', 'default');
      
      // Get user stats
      const userData = await db.get('user', 'default');
      
      // Get habits
      const habits = await db.getAll('habits');
      
      // Get all completions
      const allCompletions = await db.getAll('completions');
      
      // Filter recent completions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const completions = allCompletions.filter(
        completion => new Date(completion.completedAt) >= thirtyDaysAgo
      );
      
      // Get rewards
      const rewards = await db.getAll('rewards');
      
      // Get redemptions (last 30 days)
      const allRedemptions = await db.getAll('rewardRedemptions');
      const redemptions = allRedemptions.filter(
        redemption => new Date(redemption.redeemedAt) >= thirtyDaysAgo
      );
      
      // Calculate streak
      const streakDays = userData?.streakDays || 0;
      
      // Format recent activity
      const recentActivity = formatRecentActivity(habits, completions, rewards, redemptions);
      
      // Create the cache object
      const newCache: UserCache = {
        profile: profile || {},
        habits: habits || [],
        completions: completions || [],
        rewards: rewards || [],
        redemptions: redemptions || [],
        points: userData?.points || 0,
        streak: streakDays,
        recentActivity,
        lastUpdated: new Date()
      };
      
      setCache(newCache);
    } catch (err) {
      console.error('Failed to fetch user data for cache:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching user data'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Define activity types for type safety
  type CompletionActivity = {
    type: 'completion';
    date: Date;
    points: number;
    details: {
      habitName: string;
      habitId: string;
    };
  };
  
  type RedemptionActivity = {
    type: 'redemption';
    date: Date;
    points: number;
    details: {
      rewardName: string;
      rewardId: string;
    };
  };
  
  type Activity = CompletionActivity | RedemptionActivity;
  
  // Format recent activity for cache
  function formatRecentActivity(
    habits: WeiDB['habits']['value'][], 
    completions: WeiDB['completions']['value'][], 
    rewards: WeiDB['rewards']['value'][], 
    redemptions: WeiDB['rewardRedemptions']['value'][]
  ) {
    // Combine completions and redemptions
    const allActivities: Activity[] = [
      ...completions.map(completion => {
        const habit = habits.find(h => h.id === completion.habitId);
        return {
          type: 'completion' as const,
          date: new Date(completion.completedAt),
          points: completion.points,
          details: {
            habitName: habit?.name || 'Unknown habit',
            habitId: completion.habitId
          }
        };
      }),
      ...redemptions.map(redemption => {
        const reward = rewards.find(r => r.id === redemption.rewardId);
        return {
          type: 'redemption' as const,
          date: new Date(redemption.redeemedAt),
          points: -redemption.cost,
          details: {
            rewardName: reward?.name || 'Unknown reward',
            rewardId: redemption.rewardId
          }
        };
      })
    ];
    
    // Sort by date (newest first)
    allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    // Take the 5 most recent activities
    return allActivities.slice(0, 5).map(activity => {
      const formattedDate = activity.date.toLocaleDateString();
      
      if (activity.type === 'completion') {
        return {
          action: 'Completed',
          target: activity.details.habitName,
          date: formattedDate,
          points: activity.points
        };
      } else {
        return {
          action: 'Redeemed',
          target: activity.details.rewardName,
          date: formattedDate,
          points: activity.points
        };
      }
    });
  }

  // Initialize cache when database is available
  useEffect(() => {
    if (db && !dbLoading) {
      fetchUserData();
      
      // Refresh cache every 5 minutes
      const intervalId = setInterval(fetchUserData, 5 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [db, dbLoading]);

  const refreshCache = async () => {
    await fetchUserData();
  };

  return (
    <UserCacheContext.Provider value={{ cache, isLoading, error, refreshCache }}>
      {children}
    </UserCacheContext.Provider>
  );
}; 
```

### Providers (User Cache Context)

Wrap the app with the `UserCacheProvider` component.

open file `app/providers.tsx`.

```tsx
"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { DatabaseProvider } from "./contexts/DatabaseContext";
import { UserCacheProvider } from "./contexts/UserCacheContext";
import { ChatProvider } from "./contexts/ChatContext";
import RealTimeStreamingMode from "./RealTimeStreamingMode";
import { usePathname } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem forcedTheme={pathname === "/" ? undefined : "dark"}>
      <DatabaseProvider>
        <UserCacheProvider>
          <ChatProvider>
              {children}
              {pathname !== "/" && <RealTimeStreamingMode />}
          </ChatProvider>
        </UserCacheProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
} 
```







### Voice Chat

#### Handle Server Event (hook)

This hook is used to handle the server events.
It's used for the voice chat feature with AI Agents.
Different functions including: 
- session.created
- conversation.item.created
- conversation.item.input_audio_transcription.completed
- response.audio_transcript.delta
- response.done

You may learn more about the OpenAI Realtime API [here](https://platform.openai.com/docs/guides/realtime).

create a new file `app/hooks/useHandleServerEvent.ts`.

```tsx
"use client";

import { ServerEvent, SessionStatus, AgentConfig } from "@/app/types";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { useEvent } from "@/app/contexts/EventContext";
import { useRef } from "react";

export interface UseHandleServerEventParams {
  setSessionStatus: (status: SessionStatus) => void;
  selectedAgentName: string;
  selectedAgentConfigSet: AgentConfig[] | null;
  sendClientEvent: (eventObj: any, eventNameSuffix?: string) => void;
  setSelectedAgentName: (name: string) => void;
  setIsAssistantSpeaking?: (isSpeaking: boolean) => void;
  shouldForceResponse?: boolean;
}

export function useHandleServerEvent({
  setSessionStatus,
  selectedAgentName,
  selectedAgentConfigSet,
  sendClientEvent,
  setSelectedAgentName,
  setIsAssistantSpeaking,
}: UseHandleServerEventParams) {
  const {
    transcriptItems,
    addTranscriptBreadcrumb,
    addTranscriptMessage,
    updateTranscriptMessage,
    updateTranscriptItemStatus,
  } = useTranscript();

  const { logServerEvent } = useEvent();

  const handleFunctionCall = async (functionCallParams: {
    name: string;
    call_id?: string;
    arguments: string;
  }) => {
    const args = JSON.parse(functionCallParams.arguments);
    const currentAgent = selectedAgentConfigSet?.find(
      (a) => a.name === selectedAgentName
    );

    addTranscriptBreadcrumb(`function call: ${functionCallParams.name}`, args);

    if (currentAgent?.toolLogic?.[functionCallParams.name]) {
      const fn = currentAgent.toolLogic[functionCallParams.name];
      const fnResult = await fn(args, transcriptItems);
      addTranscriptBreadcrumb(
        `function call result: ${functionCallParams.name}`,
        fnResult
      );

      sendClientEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: functionCallParams.call_id,
          output: JSON.stringify(fnResult),
        },
      });
      sendClientEvent({ type: "response.create" });
    } else if (functionCallParams.name === "transferAgents") {
      const destinationAgent = args.destination_agent;
      const newAgentConfig =
        selectedAgentConfigSet?.find((a) => a.name === destinationAgent) || null;
      if (newAgentConfig) {
        setSelectedAgentName(destinationAgent);
      }
      const functionCallOutput = {
        destination_agent: destinationAgent,
        did_transfer: !!newAgentConfig,
      };
      sendClientEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: functionCallParams.call_id,
          output: JSON.stringify(functionCallOutput),
        },
      });
      addTranscriptBreadcrumb(
        `function call: ${functionCallParams.name} response`,
        functionCallOutput
      );
    } else {
      const simulatedResult = { result: true };
      addTranscriptBreadcrumb(
        `function call fallback: ${functionCallParams.name}`,
        simulatedResult
      );

      sendClientEvent({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: functionCallParams.call_id,
          output: JSON.stringify(simulatedResult),
        },
      });
      sendClientEvent({ type: "response.create" });
    }
  };

  const handleServerEvent = (serverEvent: ServerEvent) => {
    logServerEvent(serverEvent);

    switch (serverEvent.type) {
      case "session.created": {
        if (serverEvent.session?.id) {
          setSessionStatus("CONNECTED");
          addTranscriptBreadcrumb(
            `session.id: ${
              serverEvent.session.id
            }\nStarted at: ${new Date().toLocaleString()}`
          );
        }
        break;
      }

      case "conversation.item.created": {
        let text =
          serverEvent.item?.content?.[0]?.text ||
          serverEvent.item?.content?.[0]?.transcript ||
          "";
        const role = serverEvent.item?.role as "user" | "assistant";
        const itemId = serverEvent.item?.id;

        if (itemId && transcriptItems.some((item) => item.itemId === itemId)) {
          break;
        }

        if (itemId && role) {
          if (role === "user" && !text) {
            text = "[Transcribing...]";
          }
          addTranscriptMessage(itemId, role, text);
          
          if (role === "assistant" && setIsAssistantSpeaking) {
            setIsAssistantSpeaking(true);
          }
        }
        break;
      }

      case "conversation.item.input_audio_transcription.completed": {
        const itemId = serverEvent.item_id;
        const finalTranscript =
          !serverEvent.transcript || serverEvent.transcript === "\n"
            ? "[inaudible]"
            : serverEvent.transcript;
        if (itemId) {
          updateTranscriptMessage(itemId, finalTranscript, false);
        }
        break;
      }

      case "response.audio_transcript.delta": {
        const itemId = serverEvent.item_id;
        const deltaText = serverEvent.delta || "";
        if (itemId) {
          updateTranscriptMessage(itemId, deltaText, true);
        }
        break;
      }

      case "response.done": {
        if (serverEvent.response?.output) {
          serverEvent.response.output.forEach((outputItem) => {
            if (
              outputItem.type === "function_call" &&
              outputItem.name &&
              outputItem.arguments
            ) {
              handleFunctionCall({
                name: outputItem.name,
                call_id: outputItem.call_id,
                arguments: outputItem.arguments,
              });
            }
          });
        }
        break;
      }

      case "response.output_item.done": {
        const itemId = serverEvent.item?.id;
        if (itemId) {
          updateTranscriptItemStatus(itemId, "DONE");
          
          if (setIsAssistantSpeaking) {
            setIsAssistantSpeaking(false);
          }
        }
        break;
      }

      default:
        break;
    }
  };

  const handleServerEventRef = useRef(handleServerEvent);
  handleServerEventRef.current = handleServerEvent;

  return handleServerEventRef;
}
```

#### Real Time Streaming Mode

create a new file `app/RealTimeStreamingMode.tsx`.

```tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

// UI components
import VoiceTranscriptOverlay from "./components/VoiceTranscriptOverlay";
import VoiceButton from "./components/VoiceButton";

// Types
import { AgentConfig, SessionStatus } from "@/app/types";

// Context providers & hooks
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { useEvent } from "@/app/contexts/EventContext";
import { useHandleServerEvent } from "./hooks/useHandleServerEvent";

// Utilities
import { createRealtimeConnection } from "@/lib/realtimeConnection";

// Agent configs
import { allAgentSets, defaultAgentSetKey } from "@/app/agentConfigs";

function RealTimeStreamingMode() {
  const searchParams = useSearchParams();

  const { transcriptItems, addTranscriptMessage, addTranscriptBreadcrumb } =
    useTranscript();
  const { logClientEvent, logServerEvent } = useEvent();

  const [selectedAgentName, setSelectedAgentName] = useState<string>("");
  const [selectedAgentConfigSet, setSelectedAgentConfigSet] =
    useState<AgentConfig[] | null>(null);

  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [sessionStatus, setSessionStatus] =
    useState<SessionStatus>("DISCONNECTED");

  const pathname = usePathname();

  // Always keep logs hidden
  const [isEventsPaneExpanded, setIsEventsPaneExpanded] = useState<boolean>(false);
  const [userText, setUserText] = useState<string>("");
  const [isPTTActive, setIsPTTActive] = useState<boolean>(true); // Default to PTT active
  const [isPTTUserSpeaking, setIsPTTUserSpeaking] = useState<boolean>(false);
  const [isAudioPlaybackEnabled, setIsAudioPlaybackEnabled] = useState<boolean>(true);

  const [isVoiceModeActive, setIsVoiceModeActive] = useState<boolean>(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState<boolean>(false);

  const sendClientEvent = (eventObj: any, eventNameSuffix = "") => {
    if (dcRef.current && dcRef.current.readyState === "open") {
      logClientEvent(eventObj, eventNameSuffix);
      dcRef.current.send(JSON.stringify(eventObj));
    } else {
      logClientEvent(
        { attemptedEvent: eventObj.type },
        "error.data_channel_not_open"
      );
      console.error(
        "Failed to send message - no data channel available",
        eventObj
      );
    }
  };

  const handleServerEventRef = useHandleServerEvent({
    setSessionStatus,
    selectedAgentName,
    selectedAgentConfigSet,
    sendClientEvent,
    setSelectedAgentName,
    setIsAssistantSpeaking,
  });

  useEffect(() => {
    let finalAgentConfig = searchParams.get("agentConfig") || defaultAgentSetKey;
    if (!allAgentSets[finalAgentConfig]) {
      finalAgentConfig = defaultAgentSetKey;
    }

    const agents = allAgentSets[finalAgentConfig];
    const agentKeyToUse = agents[0]?.name || "";

    setSelectedAgentName(agentKeyToUse);
    setSelectedAgentConfigSet(agents);
  }, [searchParams]);

  // Only connect when voice mode is activated, not on initial load
  useEffect(() => {
    if (isVoiceModeActive && selectedAgentName && sessionStatus === "DISCONNECTED") {
      connectToRealtime();
    } else if (!isVoiceModeActive && sessionStatus === "CONNECTED") {
      disconnectFromRealtime();
    }
  }, [isVoiceModeActive, selectedAgentName]);

  useEffect(() => {
    if (
      sessionStatus === "CONNECTED" &&
      selectedAgentConfigSet &&
      selectedAgentName
    ) {
      const currentAgent = selectedAgentConfigSet.find(
        (a) => a.name === selectedAgentName
      );
      addTranscriptBreadcrumb(
        `Agent: ${selectedAgentName}`,
        currentAgent
      );
      updateSession(true);
    }
  }, [selectedAgentConfigSet, selectedAgentName, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "CONNECTED") {
      console.log(
        `updatingSession, isPTTACtive=${isPTTActive} sessionStatus=${sessionStatus}`
      );
      updateSession();
    }
  }, [isPTTActive]);

  const fetchEphemeralKey = async (): Promise<string | null> => {
    logClientEvent({ url: "/session" }, "fetch_session_token_request");
    const tokenResponse = await fetch("/api/session");
    const data = await tokenResponse.json();
    logServerEvent(data, "fetch_session_token_response");

    if (!data.client_secret?.value) {
      logClientEvent(data, "error.no_ephemeral_key");
      console.error("No ephemeral key provided by the server");
      setSessionStatus("DISCONNECTED");
      return null;
    }

    return data.client_secret.value;
  };

  const connectToRealtime = async () => {
    if (sessionStatus !== "DISCONNECTED") return;
    setSessionStatus("CONNECTING");

    try {
      const EPHEMERAL_KEY = await fetchEphemeralKey();
      if (!EPHEMERAL_KEY) {
        return;
      }

      if (!audioElementRef.current) {
        audioElementRef.current = document.createElement("audio");
      }
      audioElementRef.current.autoplay = isAudioPlaybackEnabled;

      const { pc, dc } = await createRealtimeConnection(
        EPHEMERAL_KEY,
        audioElementRef
      );
      pcRef.current = pc;
      dcRef.current = dc;

      dc.addEventListener("open", () => {
        logClientEvent({}, "data_channel.open");
      });
      dc.addEventListener("close", () => {
        logClientEvent({}, "data_channel.close");
      });
      dc.addEventListener("error", (err: any) => {
        logClientEvent({ error: err }, "data_channel.error");
      });
      dc.addEventListener("message", (e: MessageEvent) => {
        handleServerEventRef.current(JSON.parse(e.data));
      });

      setDataChannel(dc);
    } catch (err) {
      console.error("Error connecting to realtime:", err);
      setSessionStatus("DISCONNECTED");
    }
  };

  const disconnectFromRealtime = () => {
    if (pcRef.current) {
      pcRef.current.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });

      pcRef.current.close();
      pcRef.current = null;
    }
    setDataChannel(null);
    setSessionStatus("DISCONNECTED");
    setIsPTTUserSpeaking(false);

    logClientEvent({}, "disconnected");
  };

  const sendSimulatedUserMessage = (text: string) => {
    const id = uuidv4().slice(0, 32);
    addTranscriptMessage(id, "user", text, true);

    sendClientEvent(
      {
        type: "conversation.item.create",
        item: {
          id,
          type: "message",
          role: "user",
          content: [{ type: "input_text", text }],
        },
      },
      "(simulated user text message)"
    );
    sendClientEvent(
      { type: "response.create" },
      "(trigger response after simulated user text message)"
    );
  };

  const updateSession = (shouldTriggerResponse: boolean = false) => {
    sendClientEvent(
      { type: "input_audio_buffer.clear" },
      "clear audio buffer on session update"
    );

    const currentAgent = selectedAgentConfigSet?.find(
      (a) => a.name === selectedAgentName
    );

    const turnDetection = isPTTActive
      ? null
      : {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 200,
          create_response: true,
        };

    const instructions = currentAgent?.instructions || "";
    const tools = currentAgent?.tools || [];

    const sessionUpdateEvent = {
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        instructions,
        voice: "coral",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: { model: "whisper-1" },
        turn_detection: turnDetection,
        tools,
      },
    };

    sendClientEvent(sessionUpdateEvent);

    if (shouldTriggerResponse) {
      sendSimulatedUserMessage("hi");
    }
  };

  const cancelAssistantSpeech = async () => {
    const mostRecentAssistantMessage = [...transcriptItems]
      .reverse()
      .find((item) => item.role === "assistant");

    if (!mostRecentAssistantMessage) {
      console.warn("can't cancel, no recent assistant message found");
      return;
    }
    if (mostRecentAssistantMessage.status === "DONE") {
      console.log("No truncation needed, message is DONE");
      return;
    }

    sendClientEvent({
      type: "conversation.item.truncate",
      item_id: mostRecentAssistantMessage?.itemId,
      content_index: 0,
      audio_end_ms: Date.now() - mostRecentAssistantMessage.createdAtMs,
    });
    sendClientEvent(
      { type: "response.cancel" },
      "(cancel due to user interruption)"
    );
  };

  const handleTalkButtonDown = () => {
    if (sessionStatus !== "CONNECTED" || dataChannel?.readyState !== "open")
      return;
    cancelAssistantSpeech();

    setIsPTTUserSpeaking(true);
    sendClientEvent({ type: "input_audio_buffer.clear" }, "clear PTT buffer");
  };

  const handleTalkButtonUp = () => {
    if (
      sessionStatus !== "CONNECTED" ||
      dataChannel?.readyState !== "open" ||
      !isPTTUserSpeaking
    )
      return;

    setIsPTTUserSpeaking(false);
    sendClientEvent({ type: "input_audio_buffer.commit" }, "commit PTT");
    sendClientEvent({ type: "response.create" }, "trigger response PTT");
  };

  const handleVoiceModeToggle = () => {
    if (!isVoiceModeActive) {
      // Activate voice mode
      setIsVoiceModeActive(true);
    } else {
      // Deactivate voice mode
      setIsVoiceModeActive(false);
      setIsPTTUserSpeaking(false);
    }
  };

  // Load saved preferences
  useEffect(() => {
    // Default to audio playback enabled
    const storedAudioPlaybackEnabled = localStorage.getItem("audioPlaybackEnabled");
    if (storedAudioPlaybackEnabled) {
      setIsAudioPlaybackEnabled(storedAudioPlaybackEnabled === "true");
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem("pushToTalkUI", "true"); // Always use PTT
    localStorage.setItem("logsExpanded", "false"); // Always keep logs hidden
    localStorage.setItem("audioPlaybackEnabled", isAudioPlaybackEnabled.toString());
  }, [isAudioPlaybackEnabled]);

  // Handle audio playback changes
  useEffect(() => {
    if (audioElementRef.current) {
      if (isAudioPlaybackEnabled) {
        audioElementRef.current.play().catch((err) => {
          console.warn("Autoplay may be blocked by browser:", err);
        });
      } else {
        audioElementRef.current.pause();
      }
    }
  }, [isAudioPlaybackEnabled]);

  return (
    <>
      {/* Only render the voice button, nothing else in normal view */}

      {!isVoiceModeActive && pathname !== "/chat" && <VoiceButton 
        onClose={handleVoiceModeToggle}
        isListening={false}
        isConnected={false}
        onStart={() => {}}
        onStop={() => {}}
      />}

      {/* Voice overlay appears only when activated */}
      <VoiceTranscriptOverlay 
        isVisible={isVoiceModeActive}
        transcriptItems={transcriptItems}
        isAssistantSpeaking={isAssistantSpeaking}
        isPTTUserSpeaking={isPTTUserSpeaking}
        handleTalkButtonDown={handleTalkButtonDown}
        handleTalkButtonUp={handleTalkButtonUp}
        connectionStatus={sessionStatus}
        onClose={handleVoiceModeToggle}
      />
    </>
  );
}

export default RealTimeStreamingMode;
```

Here's a simple demonstration of more advanced, agentic patterns built on top of the Realtime API by `OpenAI`.
[openai-realtime-agents](https://github.com/openai/openai-realtime-agents)



## Integrating with AI/ML API and OpenAI Realtime API

### OpenAI Realtime API

To use the OpenAI Realtime API, we need to create a new session. 
And it should happen every time when user hits the Voice chat option.
Create a new file `app/api/session/route.ts`.

```ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
        }),
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
```

### Set up .env

```
AIML_API_KEY=...
GIPHY_API_KEY=...
```

## Storing data locally using IndexedDB