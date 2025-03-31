import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // Import MongoDB connection
import User from "./models/User.js"; // Import User Schema
import Problem from "./models/Problem.js"; // Import Problem Schema
import LeaderboardEntry from "./models/LeaderboardEntry.js"; // Import LeaderboardEntry Schema
import Quest from "./models/Quest.js"; // Import Quest Schema

// Load environment variables
dotenv.config(); 

// Connect to MongoDB
connectDB(); 

const app = express();
const PORT = process.env.PORT || 5000;
const WEBSITE_URL = process.env.WEBSITE_URL || 'http://localhost:5000';

app.use(cors());
app.use(express.json()); // Enable JSON parsing

// Log server info on startup
console.log(`🌐 API Base URL: ${WEBSITE_URL}`);

app.post("/api/storeProblem", async (req, res) => {
  const { handle, problem } = req.body;

  if (!handle || !problem) {
    return res.status(400).json({ error: "Missing 'handle' or 'problem' data" });
  }

  try {
    const existingUser = await User.findOne({ handle }).populate("currentProblem");

    if (existingUser && existingUser.currentProblem) {
      return res.json({ message: "User already has a problem", problem: existingUser.currentProblem });
    }

    const newProblem = new Problem({ ...problem, assignedTo: handle });
    await newProblem.save();

    if (existingUser) {
      existingUser.currentProblem = newProblem._id;
      await existingUser.save();
    } else {
      const newUser = new User({ handle, currentProblem: newProblem._id });
      await newUser.save();
    }

    res.json({ message: "Problem stored successfully", problem: newProblem });
  } catch (error) {
    console.error("Error storing problem:", error);
    res.status(500).json({ error: "Failed to store problem" });
  }
});

// 1️⃣ GET CODEFORCES CONTESTS
app.get("/proxy/codeforces/getcontests", async (req, res) => {
  try {
    const response = await axios.get("https://codeforces.com/api/contest.list");
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contests" });
  }
});

// 2️⃣ GET CODEFORCES SUBMISSIONS
app.get("/proxy/codeforces/getSubmissions", async (req, res) => {
  const { handle } = req.query;
  if (!handle) return res.status(400).json({ error: "Missing 'handle' parameter" });

  try {
    const response = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// 3️⃣ GET CODEFORCES STANDINGS
app.get("/proxy/codeforces/getStandings", async (req, res) => {
  const { contestId } = req.query;
  if (!contestId) return res.status(400).json({ error: "Missing 'contestId' parameter" });

  try {
    const response = await axios.get(
      `https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1&showUnofficial=false`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contest standings" });
  }
});

// 4️⃣ CREATE USER PROFILE (Register User)
app.post("/api/users", async (req, res) => {
  const { handle } = req.body;
  console.log(handle);
  if (!handle) return res.status(400).json({ error: "Missing 'handle' parameter" });

  try {
    const existingUser = await User.findOne({ handle });
    if (existingUser) return res.status(400).json({ error: "User already exists" });
    const newUser = new User({ handle });
    await newUser.save();
    res.json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user" });
  }
});
// 5️⃣ FETCH USER PROFILE BY HANDLE
app.get("/api/users/:handle", async (req, res) => {
  try {
    const user = await User.findOne({ handle: req.params.handle });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});
// 6️⃣ UPDATE USER XP & PROBLEM SOLVING DATA
app.put("/api/users/:handle/update", async (req, res) => {
  const { experience, totalProblemsSolved, problemId, problemName, contestId } = req.body;
  try {
    const user = await User.findOne({ handle: req.params.handle });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if we need to reset daily XP (if it's a new day)
    const today = new Date();
    const lastReset = new Date(user.lastXPReset);
    if (today.getDate() !== lastReset.getDate() || 
        today.getMonth() !== lastReset.getMonth() ||
        today.getFullYear() !== lastReset.getFullYear()) {
      user.dailyXP = 0;
      user.lastXPReset = today;
    }

    if (experience) {
      user.experience += experience;
      user.dailyXP += experience;
    
      // Add entry to leaderboard
      if (problemId && problemName) {
        const newEntry = new LeaderboardEntry({
          handle: user.handle,
          displayName: user.handle, // Using handle as displayName
          xpGained: experience,
          problemId: problemId,
          problemName: problemName,
          contestId: contestId
        });
        await newEntry.save();
      }
    }
    
    if (totalProblemsSolved) user.totalProblemsSolved += totalProblemsSolved;
    
    // Update title based on experience
    if (user.experience >= 1000) user.title = "Grandmaster";
    else if (user.experience >= 500) user.title = "Expert";
    else if (user.experience >= 250) user.title = "Pupil";
    else user.title = "Newbie";
    
    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user data" });
  }
});
  
// 7️⃣ DELETE USER PROFILE
app.delete("/api/users/:handle", async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ handle: req.params.handle });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});
//DELETE PROBLEM 
app.delete("/api/deleteProblem", async (req, res) => {
  const { handle } = req.body;

  if (!handle) return res.status(400).json({ error: "Missing 'handle' parameter" });

  try {
    const user = await User.findOne({ handle });

    if (!user || !user.currentProblem) {
      return res.status(404).json({ error: "No problem found to delete" });
    }
    await Problem.findByIdAndDelete(user.currentProblem); // Delete problem
    user.currentProblem = null; // Remove reference from user
    await user.save();
    res.json({ message: "Problem deleted successfully" });
  } catch (error) {
    console.error("Error deleting problem:", error);
    res.status(500).json({ error: "Failed to delete problem" });
  }
});

//GET PROBLEM
app.get("/api/getStoredProblem", async (req, res) => {
  const { handle } = req.query;

  if (!handle) return res.status(400).json({ error: "Missing 'handle' parameter" });
  try {
    const user = await User.findOne({ handle }).populate("currentProblem");
    if (!user || !user.currentProblem) {
      return res.json({ message: "No stored problem found", problem: null });
    }

    res.json({ problem: user.currentProblem });
  } catch (error) {
    console.error("Error fetching stored problem:", error);
    res.status(500).json({ error: "Failed to fetch stored problem" });
  }
});

// NEW ENDPOINTS FOR LEADERBOARD

// Get leaderboard entries (with pagination)
app.get("/api/leaderboard", async (req, res) => {
  try {
    const { limit = 20, skip = 0, handle } = req.query;
    
    // Build query - optionally filter by handle
    const query = handle ? { handle } : {};
    
    // Get entries sorted by date (most recent first)
    const entries = await LeaderboardEntry.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
      
    // Get total count for pagination
    const total = await LeaderboardEntry.countDocuments(query);
    
    res.json({
      entries,
      pagination: {
        total,
        page: Math.floor(skip / limit) + 1,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard data" });
  }
});

// Get daily XP summary for a user
app.get("/api/users/:handle/dailyXP", async (req, res) => {
  try {
    const user = await User.findOne({ handle: req.params.handle });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json({
      handle: user.handle,
      dailyXP: user.dailyXP,
      lastReset: user.lastXPReset
    });
  } catch (error) {
    console.error("Error fetching daily XP:", error);
    res.status(500).json({ error: "Failed to fetch daily XP data" });
  }
});

// Get today's activity data for a user (problems solved and XP earned)
app.get("/api/users/:handle/daily-activity", async (req, res) => {
  try {
    const user = await User.findOne({ handle: req.params.handle });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Get today's date at start of day (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find problems solved today - use the date field for comparison
    const problemsSolvedToday = await LeaderboardEntry.countDocuments({
      handle: req.params.handle,
      date: { $gte: today }
    });
    
    // Use the user's dailyXP directly since it's already being tracked and reset daily
    // This is more reliable than calculating from LeaderboardEntry
    
    res.json({
      handle: user.handle,
      problemsSolved: problemsSolvedToday,
      xpEarned: user.dailyXP || 0,
      date: today
    });
  } catch (error) {
    console.error("Error fetching daily activity:", error);
    res.status(500).json({ error: "Failed to fetch daily activity data" });
  }
});

// SIDE QUESTS API ENDPOINTS

// Get all quests for a user
app.get("/api/users/:handle/quests", async (req, res) => {
  try {
    const { handle } = req.params;
    
    // First find the user to make sure they exist and get their ID
    const user = await User.findOne({ handle });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Get all quests for this user
    const quests = await Quest.find({ userHandle: handle }).sort({ createdAt: -1 });
    
    res.json(quests);
  } catch (error) {
    console.error("Error fetching quests:", error);
    res.status(500).json({ error: "Failed to fetch quests data" });
  }
});

// Create a new quest
app.post("/api/users/:handle/quests", async (req, res) => {
  try {
    const { handle } = req.params;
    const { title, description, xpReward } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: "Quest title is required" });
    }
    
    // First find the user to make sure they exist and get their ID
    const user = await User.findOne({ handle });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Create new quest
    const newQuest = new Quest({
      title,
      description,
      xpReward: parseInt(xpReward) || 50,
      userId: user._id,
      userHandle: handle
    });
    
    await newQuest.save();
    
    res.status(201).json(newQuest);
  } catch (error) {
    console.error("Error creating quest:", error);
    res.status(500).json({ error: "Failed to create quest" });
  }
});

// Mark a quest as completed
app.put("/api/users/:handle/quests/:questId/complete", async (req, res) => {
  try {
    const { handle, questId } = req.params;
    
    // First find the user
    const user = await User.findOne({ handle });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Find the quest and verify it belongs to the user
    const quest = await Quest.findOne({ _id: questId, userHandle: handle });
    
    if (!quest) {
      return res.status(404).json({ error: "Quest not found or not owned by this user" });
    }
    
    // If quest is already completed, return error
    if (quest.completed) {
      return res.status(400).json({ error: "Quest is already completed" });
    }
    
    // Mark as completed
    quest.completed = true;
    quest.completedAt = new Date();
    await quest.save();
    
    res.json(quest);
  } catch (error) {
    console.error("Error completing quest:", error);
    res.status(500).json({ error: "Failed to complete quest" });
  }
});

// Delete a quest
app.delete("/api/users/:handle/quests/:questId", async (req, res) => {
  try {
    const { handle, questId } = req.params;
    
    // First find the user
    const user = await User.findOne({ handle });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Find and delete the quest only if it belongs to the user
    const result = await Quest.findOneAndDelete({ _id: questId, userHandle: handle });
    
    if (!result) {
      return res.status(404).json({ error: "Quest not found or not owned by this user" });
    }
    
    res.json({ message: "Quest deleted successfully" });
  } catch (error) {
    console.error("Error deleting quest:", error);
    res.status(500).json({ error: "Failed to delete quest" });
  }
});

// Update highest experience achieved if current experience is higher
app.put("/api/users/:handle/update-highest-xp", async (req, res) => {
  try {
    const { handle } = req.params;
    
    const user = await User.findOne({ handle });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // If current experience is higher than highest recorded, update it
    if (user.experience > user.highestExperience) {
      user.highestExperience = user.experience;
      await user.save();
    }
    
    res.json({
      handle: user.handle,
      experience: user.experience,
      highestExperience: user.highestExperience
    });
  } catch (error) {
    console.error("Error updating highest XP:", error);
    res.status(500).json({ error: "Failed to update highest XP" });
  }
});

// START SERVER
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
