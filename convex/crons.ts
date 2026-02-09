import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Run the market scanner and strategy engine every 2 minutes
// This makes the bot highly responsive for real-time signals
crons.interval(
  "neural-trading-heartbeat",
  { minutes: 2 },
  api.orchestrator.executeBrainTurn,
  {}
);

export default crons;
