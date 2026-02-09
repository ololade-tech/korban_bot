import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Run the market scanner and strategy engine every 15 minutes
// This makes the bot truly autonomous
crons.interval(
  "neural-trading-heartbeat",
  { minutes: 15 },
  api.orchestrator.executeBrainTurn
);

export default crons;
