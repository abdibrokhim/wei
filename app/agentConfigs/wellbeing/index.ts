import rewardsManager from "./rewards-manager";
import pointsCalculator from "./points-calculator";
import habitTracker from "./habit-tracker";
import { injectTransferTools } from "../utils";

rewardsManager.downstreamAgents = [pointsCalculator, habitTracker];
pointsCalculator.downstreamAgents = [rewardsManager, habitTracker];
habitTracker.downstreamAgents = [rewardsManager, pointsCalculator];

const agents = injectTransferTools([
  rewardsManager,
  pointsCalculator,
  habitTracker,
]);

export default agents;