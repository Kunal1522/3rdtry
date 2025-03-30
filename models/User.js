import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  handle: { type: String, required: true, unique: true }, // Codeforces Handle
  title: { type: String, default: "Newbie" }, // User Rank
  experience: { type: Number, default: 0 }, // XP Earned
  totalProblemsSolved: { type: Number, default: 0 }, // Problem Solving Count
  currentProblem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" }, // ✅ Store reference to the assigned problem
  dailyXP: { type: Number, default: 0 }, // XP earned today
  lastXPReset: { type: Date, default: Date.now } // When daily XP was last reset
});

const User = mongoose.model("User", userSchema);
export default User;
