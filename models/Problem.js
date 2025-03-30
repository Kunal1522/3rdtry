import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  contestId: { type: Number, required: true },
  index: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String },
  points: { type: Number },
  rating: { type: Number },
  tags: { type: [String] },
  assignedTo: { type: String, required: true } // ✅ User handle who is solving this problem
});

const Problem = mongoose.model("Problem", problemSchema);
export default Problem;
