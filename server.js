import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // Import MongoDB connection
import User from "./models/User.js"; // Import User Schema

dotenv.config(); // Load environment variables
connectDB(); // Connect to MongoDB

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Enable JSON parsing

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
  const { experience, totalProblemsSolved } = req.body;
  try {
    const user = await User.findOne({ handle: req.params.handle });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (experience) user.experience += experience;
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

// START SERVER
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
