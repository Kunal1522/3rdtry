import mongoose from "mongoose";

const QuestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  xpReward: {
    type: Number,
    required: true,
    default: 50,
    min: 10
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userHandle: {
    type: String,
    required: true
  }
});

const Quest = mongoose.model('Quest', QuestSchema);

export default Quest;