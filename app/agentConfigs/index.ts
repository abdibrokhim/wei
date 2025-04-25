import { AllAgentConfigsType } from "@/app/types";
import greeter from "./greeter";
import wellbeing from "./wellbeing";

export const allAgentSets: AllAgentConfigsType = {
  wellbeing,
  greeter,
};

export const defaultAgentSetKey = "greeter";
