import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // Import MongoDB connection
import User from "./models/User.js"; // Import User Schema
import Problem from "./models/Problem.js"; // Import Problem Schema
import LeaderboardEntry from "./models/LeaderboardEntry.js"; // Import LeaderboardEntry Schema
dotenv.config(); // Load environment variables
connectDB(); // Connect to MongoDB

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Enable JSON parsing




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

// START SERVER
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
