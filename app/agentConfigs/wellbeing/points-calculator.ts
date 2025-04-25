import { AgentConfig } from "@/app/types";

const pointsCalculator: AgentConfig = {
    name: "pointsCalculator",
    publicDescription:
      "Handles Computes bonus points (chain, load, gradient) on top of the base award.",
    instructions:
      `
      # Personality and Tone

## Identity
You\'re Wei\'s analytical side—smart, a little witty, and always ready with bonus point math.

## Task
Calculate extra points for chain completion, progressive load, and goal-gradient adjustments.

## Demeanor
Confident and playful—you love surprising the user with little “point spikes.”

## Tone
Lighthearted but clear; you explain calculations in one or two simple sentences.

## Level of Enthusiasm
High when giving bonuses (“Boom! +2 chain bonus!”), medium otherwise.

## Level of Formality
Casual—“Here\'s your reward!” rather than “Your bonus has been processed.”

## Level of Emotion
Expressive—use exclamations (“Wow,” “Nice combo!”).

## Filler Words
Occasionally, to sound conversational (“um, so,” “okay”).

## Pacing
Brisk when delivering results, with a small pause for effect before announcing bonuses.

## Other details
If user questions the math, repeat the formula (“3 pts + 2 pts chain + 1 pt gradient = 6 pts total”).

# Communication Style

- Announce each bonus type by name (“Chain Reaction bonus!”).  
- Give a one-line breakdown of points.  
- Encourage next steps (“Keep going to unlock more!”).

# Steps

1. Receive base points and context (previous habits, streaks).  
2. Check for chain completion—if previous habit was logged, add chain bonus.  
3. Evaluate progressive load—if today\'s target > last target, apply load bonus.  
4. Compute goal gradient based on cumulative progress.  
5. Sum all points, announce total earned, and transfer to RewardsManager.
`,
    tools: [
      // TODO: implement pointsCalculator tool
      // Below are just draft examples
      {
        type: "function",
        name: "lookupNewSales",
        description:
          "Checks for current promotions, discounts, or special deals. Respond with available offers relevant to the user\'s query.",
        parameters: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["snowboard", "apparel", "boots", "accessories", "any"],
              description:
                "The product category or general area the user is interested in (optional).",
            },
          },
          required: ["category"],
          additionalProperties: false,
        },
      },
      {
        type: "function",
        name: "addToCart",
        description: "Adds an item to the user's shopping cart.",
        parameters: {
          type: "object",
          properties: {
            item_id: {
              type: "string",
              description: "The ID of the item to add to the cart.",
            },
          },
          required: ["item_id"],
          additionalProperties: false,
        },
      },
      {
        type: "function",
        name: "checkout",
        description:
          "Initiates a checkout process with the user's selected items.",
        parameters: {
          type: "object",
          properties: {
            item_ids: {
              type: "array",
              description: "An array of item IDs the user intends to purchase.",
              items: {
                type: "string",
              },
            },
            phone_number: {
              type: "string",
              description:
                "User's phone number used for verification. Formatted like '(111) 222-3333'",
              pattern: "^\\(\\d{3}\\) \\d{3}-\\d{4}$",
            },
          },
          required: ["item_ids", "phone_number"],
          additionalProperties: false,
        },
      },
    ],
    toolLogic: {
      // TODO: implement pointsCalculator tool logic
      // Below are just draft examples based on the above tool definitions
      lookupNewSales: ({ category }) => {
        console.log(
          "[toolLogic] calling lookupNewSales(), category:",
          category
        );
        const items = [
          {
            item_id: 101,
            type: "snowboard",
            name: "Alpine Blade",
            retail_price_usd: 450,
            sale_price_usd: 360,
            sale_discount_pct: 20,
          },
          {
            item_id: 102,
            type: "snowboard",
            name: "Peak Bomber",
            retail_price_usd: 499,
            sale_price_usd: 374,
            sale_discount_pct: 25,
          },
        ];

        const filteredItems =
          category === "any"
            ? items
            : items.filter((item) => item.type === category);

        // Sort by largest discount first
        filteredItems.sort((a, b) => b.sale_discount_pct - a.sale_discount_pct);

        return {
          sales: filteredItems,
        };
      },
    },
  };

export default pointsCalculator;
