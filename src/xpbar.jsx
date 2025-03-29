import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const XPBar = ({ level, xp, nextLevelXP }) => {
  const progress = (xp / nextLevelXP) * 100;
  return (
    <div className="fixed top-4 right-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white p-4 rounded-3xl shadow-2xl w-72">
      <div className="flex justify-between items-center">
        <span className="text-xl font-extrabold">Level {level}</span>
        <span className="text-sm text-gray-200">{xp}/{nextLevelXP} XP</span>
      </div>
      <div className="mt-3 bg-gray-700 h-3 rounded-full overflow-hidden">
        <motion.div
          className="h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

export default function XPDisplay({ handle }) {
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${handle}`);
        console.log(response);
        
        const data = await response.json();
        console.log(data);
        if (response.ok) {
          setXP(data.experience);
          setLevel(determineLevel(data.experience));
        } else {
          console.error("❌ Error:", data.error);
        }
      } catch (error) {
        console.error("❌ Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [handle]);

  const determineLevel = (xp) => {
    if (xp >= 1000) return 5;
    if (xp >= 500) return 4;
    if (xp >= 250) return 3;
    if (xp >= 100) return 2;
    return 1;
  };

  const nextLevelXP = level * 100;

  if (loading) return null; // Hide bar while loading
  return <XPBar level={level} xp={xp} nextLevelXP={nextLevelXP} />;
}
