import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TIERS = [
  { xp: 120, title: "Fastforces Speedrunner ⚡", next: 250 },
  { xp: 250, title: "Brute-Force Optimizer 💪", next: 440 },
  { xp: 440, title: "STL Overlord 👑", next: 700 },
  { xp: 700, title: "Greedy Proof Artist 🎨", next: 1000 },
  { xp: 1000, title: "The DP Sensei 🥋", next: 1400 },
  { xp: 1400, title: "Binary Search Enjoyer 🔍", next: 1950 },
  { xp: 1950, title: "Off-by-One Terminator 🤖", next: 2800 },
  { xp: 2800, title: "Observation God 👁️", next: 4000 },
  { xp: 4000, title: "Data Structure Wizard 🧙", next: 5600 },
  { xp: 5600, title: "Complexity Magician 🎩", next: 8000 },
  { xp: 8000, title: "Raid Boss of Heavy-Light 🏴‍☠️", next: 11200 },
  { xp: 11200, title: "The AC Machine 🤖", next: 15600 },
  { xp: 15600, title: "ICPC Final Boss 🏆", next: 21000 },
  { xp: 21000, title: "The Untouchable Red 🔴", next: 30000 },
  { xp: 30000, title: "❗ The Problem Setter ❗ ✍️", next: Infinity }
];

const XPBar = ({ levelData, xp, className }) => {
  const progress = ((xp - levelData.xp) / (levelData.next - levelData.xp)) * 100;
  const progressBarWidth = Math.min(Math.max(progress, 0), 100); // Ensure value is between 0-100
  
  // Generate terminal-style progress bar
  const barLength = 25; // characters in progress bar
  const filledChars = Math.floor((progressBarWidth / 100) * barLength);
  const emptyChars = barLength - filledChars;
  const progressBar = '[' + '='.repeat(filledChars) + ' '.repeat(emptyChars) + ']';

  return (
    <div className={`font-mono border border-green-500/30 p-4 bg-black/80 ${className || ''}`}>
      <div className="mb-2 text-center">
        <motion.div
          key={levelData.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-bold text-green-400"
        >
          {levelData.title}
        </motion.div>
      </div>
      
      <div className="text-xs text-green-300 font-mono mb-1">
        <span>$ cat progress.txt</span>
      </div>
      
      <pre className="text-green-400 font-mono text-xs mb-2">
        {`XP: ${xp}/${levelData.next} ${progressBar} ${Math.round(progress)}%`}
      </pre>
      
      <div className="text-xs text-green-300 font-mono">
        <span>$ echo $((${levelData.next - xp})) XP needed for next level</span>
      </div>
      
      <AnimatePresence>
        {progress >= 95 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-xs text-yellow-300 font-mono"
          >
            $ alert "LEVEL UP AVAILABLE!"
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function XPDisplay({ handle, className }) {
  const [xp, setXP] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(TIERS[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${handle}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setXP(data.experience);
        setCurrentLevel(determineLevel(data.experience));
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [handle]);

  const determineLevel = (xp) => {
    for (let i = TIERS.length - 1; i >= 0; i--) {
      if (xp >= TIERS[i].xp) return TIERS[i];
    }
    return TIERS[0];
  };

  if (loading) {
    return (
      <div className={`font-mono border border-green-500/30 p-4 bg-black/80 ${className || ''}`}>
        <div className="text-green-400 font-mono">
          <span>$ Loading user data...</span>
          <span className="animate-pulse">_</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`font-mono border border-red-500/30 p-4 bg-black/80 ${className || ''}`}>
        <div className="text-red-400 font-mono text-sm">
          <span>$ ERROR: Failed to fetch user data</span>
        </div>
        <div className="text-red-300 font-mono text-xs mt-1">
          <span>$ cat error.log</span><br />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return <XPBar levelData={currentLevel} xp={xp} className={className} />;
}