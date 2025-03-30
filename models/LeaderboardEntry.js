import mongoose from "mongoose";

const leaderboardEntrySchema = new mongoose.Schema({
  handle: { type: String, required: true, index: true },
  displayName: { type: String, required: true },
  xpGained: { type: Number, required: true },
  problemId: { type: String, required: true },
  problemName: { type: String, required: true },
  contestId: { type: Number, required: true },
  date: { type: Date, default: Date.now, index: true }
});

// Create indexes for efficient queries
leaderboardEntrySchema.index({ handle: 1, date: -1 });

const LeaderboardEntry = mongoose.model("LeaderboardEntry", leaderboardEntrySchema);
export default LeaderboardEntry;