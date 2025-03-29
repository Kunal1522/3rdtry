import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  handle: { type: String, required: true, unique: true }, // Codeforces Handle
  title: { type: String, default: "Newbie" }, // User Rank
  experience: { type: Number, default: 0 }, // XP Earned
  totalProblemsSolved: { type: Number, default: 0 }, // Problem Solving Count
});

const User = mongoose.model("user", userSchema);
export default User;
