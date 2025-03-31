import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./context/ThemeContext";

// Import the TIERS directly from xpbar.jsx
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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Daily summary component
const DailySummaryCard = ({ date, totalXP, entries, dayNumber, isHighest, isToday, handle, theme }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="mb-3 overflow-hidden"
      style={{
        backgroundColor: theme.cardBgColor,
        borderRadius: theme.borderRadius,
        border: `1px solid ${isHighest ? theme.accentColor : isToday ? theme.primaryColor : theme.borderColor}`,
        boxShadow: theme.boxShadow,
        fontFamily: theme.fontFamily
      }}
    >
      {/* Header with date and total XP */}
      <div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer gap-2 sm:gap-0 p-3"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          borderBottom: isExpanded ? `1px solid ${theme.borderColor}` : 'none'
        }}
      >
        <div className="flex flex-wrap items-center gap-2 max-w-full">
          <span className="text-base font-medium" style={{ color: theme.primaryColor }}>Day {dayNumber}</span>
          <span className="text-sm" style={{ color: theme.textColor }}>{date}</span>
          <div className="flex gap-1 flex-wrap">
            {isHighest && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{
                backgroundColor: theme.highlightColor,
                color: theme.accentColor,
                border: `1px solid ${theme.accentColor}`
              }}>
                Best Day
              </span>
            )}
            {isToday && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{
                backgroundColor: theme.highlightColor,
                color: theme.primaryColor,
                border: `1px solid ${theme.primaryColor}`
              }}>
                Today
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
          <div className="px-3 py-1 rounded-full text-sm font-semibold" style={{
            backgroundColor: theme.highlightColor,
            color: theme.primaryColor
          }}>
            +{totalXP} XP
          </div>
          <button 
            className="w-6 h-6 flex items-center justify-center"
            style={{
              color: theme.primaryColor,
              borderRadius: '50%',
              backgroundColor: theme.highlightColor
            }}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>
      
      {/* Expandable problem details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-2">
              {entries.map((entry) => (
                <div 
                  key={entry._id} 
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-1 sm:gap-0 pb-2 mb-2"
                  style={{
                    borderBottom: `1px solid ${theme.borderColor}`,
                  }}
                >
                  <div className="max-w-full overflow-hidden">
                    <span className="block font-medium" style={{ color: theme.textColor }}>{entry.problemName}</span>
                    <div className="text-xs" style={{ color: theme.textColor, opacity: 0.7 }}>
                      <span className="inline-block">Problem {entry.problemId}</span> • {formatDateTime(entry.date)}
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded-md text-xs whitespace-nowrap self-start sm:self-center mt-1 sm:mt-0"
                    style={{
                      backgroundColor: theme.highlightColor,
                      color: theme.primaryColor
                    }}
                  >
                    +{entry.xpGained} XP
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Tier progression component using the same tiers as xpbar.jsx
const TierProgressionCard = ({ userData, theme }) => {
  if (!userData) return null;
  
  // Logic for finding the highest achieved tier (immutable)
  const determineHighestTier = () => {
    for (let i = TIERS.length - 1; i >= 0; i--) {
      if (userData.highestExperience >= TIERS[i].xp) return TIERS[i];
    }
    return TIERS[0];
  };
  
  // Logic for finding the current tier based on current XP
  const determineCurrentTier = () => {
    for (let i = TIERS.length - 1; i >= 0; i--) {
      if (userData.experience >= TIERS[i].xp) return TIERS[i];
    }
    return TIERS[0];
  };
  
  // Get the highest achieved tier (for immutable progress)
  const highestTier = determineHighestTier();
  
  // Get the current tier based on current XP
  const currentTier = determineCurrentTier();
  
  // For display purposes, we always show the highest achieved tier
  const displayTier = highestTier.xp > currentTier.xp ? highestTier : currentTier;
  
  // Find the next tier
  const nextTierIndex = TIERS.findIndex(t => t.xp === displayTier.xp) + 1;
  const nextTier = nextTierIndex < TIERS.length ? TIERS[nextTierIndex] : null;
  
  // Calculate progress percentage to next tier
  const progressToNextTier = nextTier 
    ? Math.min(100, Math.floor(((userData.experience - displayTier.xp) / (nextTier.xp - displayTier.xp)) * 100))
    : 100;
  
  return (
    <div 
      className="mb-4 p-4"
      style={{
        backgroundColor: theme.cardBgColor,
        borderRadius: theme.borderRadius,
        border: `1px solid ${theme.borderColor}`,
        boxShadow: theme.boxShadow,
        fontFamily: theme.fontFamily
      }}
    >
      <h3 className="text-lg font-bold mb-3" style={{ color: theme.textColor }}>Current Rank</h3>
      
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-12 h-12 flex items-center justify-center font-bold rounded-full"
          style={{
            backgroundColor: theme.highlightColor,
            color: theme.primaryColor,
            border: `2px solid ${theme.primaryColor}`
          }}
        >
          {displayTier.title.charAt(0)}
        </div>
        <div>
          <div className="font-bold" style={{ color: theme.primaryColor }}>{displayTier.title}</div>
          <div className="text-sm" style={{ color: theme.textColor }}>
            {userData.experience} XP total
          </div>
        </div>
      </div>
      
      {nextTier && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: theme.textColor }}>Progress to {nextTier.title}</span>
            <span style={{ color: theme.primaryColor }}>{progressToNextTier}%</span>
          </div>
          <div 
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: theme.highlightColor }}
          >
            <div 
              className="h-full rounded-full"
              style={{ 
                width: `${progressToNextTier}%`,
                backgroundColor: theme.primaryColor
              }}
            ></div>
          </div>
          <div className="text-xs mt-1" style={{ color: theme.textColor, opacity: 0.7 }}>
            {nextTier.xp - userData.experience} XP needed for next rank
          </div>
        </div>
      )}
      
      {highestTier.xp > currentTier.xp && (
        <div className="mt-3 px-3 py-2 rounded-md text-sm" style={{
          backgroundColor: theme.highlightColor,
          color: theme.textColor
        }}>
          <span className="font-bold" style={{ color: theme.primaryColor }}>Note:</span> You've reached {highestTier.title} rank previously. Your rank will never drop below this level.
        </div>
      )}
    </div>
  );
};

export default function Leaderboard({ handle }) {
  const { currentTheme } = useTheme();
  const [entries, setEntries] = useState([]);
  const [groupedByDate, setGroupedByDate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dailySummary, setDailySummary] = useState(null);
  const [userData, setUserData] = useState(null);

  const limit = 100; // Increased to get more entries for grouping by date
  
  // Fetch leaderboard entries
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const skip = (page - 1) * limit;
        const response = await axios.get(`http://localhost:5000/api/leaderboard?handle=${handle}&limit=${limit}&skip=${skip}`);
        
        setEntries(response.data.entries);
        setTotalPages(Math.max(1, response.data.pagination.pages));
        
        // Also fetch daily summary
        const dailyResponse = await axios.get(`http://localhost:5000/api/users/${handle}/dailyXP`);
        setDailySummary(dailyResponse.data);
        
        // Fetch user data for tier tracking
        const userResponse = await axios.get(`http://localhost:5000/api/users/${handle}`);
        setUserData(userResponse.data);
        
        // Group entries by date
        const grouped = groupEntriesByDate(response.data.entries);
        setGroupedByDate(grouped);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setError("Failed to load leaderboard data");
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [handle, page]);
  
  // Group entries by date and calculate daily totals
  const groupEntriesByDate = (entries) => {
    const groups = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.date);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const formattedDate = formatDate(date);
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: formattedDate,
          rawDate: date,
          dateKey: dateKey,
          entries: [],
          totalXP: 0
        };
      }
      
      groups[dateKey].entries.push(entry);
      groups[dateKey].totalXP += entry.xpGained;
    });
    
    // Convert to array and sort by date chronologically (newest first)
    const sortedDays = Object.values(groups).sort((a, b) => {
      return b.rawDate - a.rawDate; // Sort by date (newest first)
    });
    
    // Add day numbers (chronologically - first day is day 1)
    let dayCounter = sortedDays.length;
    sortedDays.forEach(day => {
      day.dayNumber = dayCounter--;
    });
    
    return sortedDays;
  };
  
  // Find the day with the highest XP
  const getHighestXPDay = () => {
    if (groupedByDate.length === 0) return null;
    
    // Find the highest XP day
    let highestXP = 0;
    let highestDay = null;
    
    for (const day of groupedByDate) {
      if (day.totalXP > highestXP) {
        highestXP = day.totalXP;
        highestDay = day.dateKey;
      }
    }
    
    return highestDay;
  };
  
  // Check if a day is today
  const isToday = (dateKey) => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    return dateKey === todayKey;
  };
  
  const highestXPDay = getHighestXPDay();
  
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-4" style={{ color: currentTheme.textColor }}>
          Progress & Achievements
        </h2>
      </div>
      
      {/* Tier progression card */}
      <TierProgressionCard userData={userData} theme={currentTheme} />
      
      {/* Daily activity summary */}
      {dailySummary && dailySummary.dailyXP > 0 && (
        <div 
          className="mb-4 p-4"
          style={{
            backgroundColor: currentTheme.cardBgColor,
            borderRadius: currentTheme.borderRadius,
            border: `1px solid ${currentTheme.borderColor}`,
            boxShadow: currentTheme.boxShadow,
            fontFamily: currentTheme.fontFamily
          }}
        >
          <h3 className="text-lg font-bold mb-3" style={{ color: currentTheme.textColor }}>Today's Progress</h3>
          <div className="flex items-center justify-between">
            <span style={{ color: currentTheme.textColor }}>XP earned today</span>
            <span 
              className="text-xl font-bold px-3 py-1 rounded-md"
              style={{ 
                color: currentTheme.primaryColor,
                backgroundColor: currentTheme.highlightColor
              }}
            >
              +{dailySummary.dailyXP} XP
            </span>
          </div>
        </div>
      )}
      
      {/* Leaderboard entries */}
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-3" style={{ color: currentTheme.textColor }}>Activity Log</h3>
        
        {loading ? (
          <div 
            className="flex flex-col items-center justify-center py-6"
            style={{ 
              backgroundColor: currentTheme.cardBgColor,
              borderRadius: currentTheme.borderRadius,
              color: currentTheme.textColor
            }}
          >
            <div className="loading-spinner mb-3" style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              border: `2px solid ${currentTheme.borderColor}`,
              borderTopColor: currentTheme.primaryColor,
              animation: 'spin 1s linear infinite'
            }}></div>
            <p>Loading your progress data...</p>
          </div>
        ) : error ? (
          <div 
            className="py-4 px-3"
            style={{ 
              backgroundColor: currentTheme.cardBgColor,
              borderRadius: currentTheme.borderRadius,
              color: "#ff6b6b"
            }}
          >
            <p>Error: {error}</p>
          </div>
        ) : groupedByDate.length === 0 ? (
          <div 
            className="py-6 px-4 text-center"
            style={{ 
              backgroundColor: currentTheme.cardBgColor,
              borderRadius: currentTheme.borderRadius,
              color: currentTheme.textColor
            }}
          >
            <p>No activity data found. Solve problems to start tracking your progress.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="inline-flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: currentTheme.accentColor
                  }}
                ></span>
                <span 
                  className="text-sm"
                  style={{ color: currentTheme.textColor }}
                >
                  Best Day
                </span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: currentTheme.primaryColor
                  }}
                ></span>
                <span 
                  className="text-sm"
                  style={{ color: currentTheme.textColor }}
                >
                  Today
                </span>
              </div>
            </div>
            
            <AnimatePresence>
              {groupedByDate.map((day) => (
                <DailySummaryCard 
                  key={day.dateKey} 
                  date={day.date}
                  totalXP={day.totalXP}
                  entries={day.entries}
                  dayNumber={day.dayNumber}
                  isHighest={day.dateKey === highestXPDay}
                  isToday={isToday(day.dateKey)}
                  handle={handle}
                  theme={currentTheme}
                />
              ))}
            </AnimatePresence>
            
            {totalPages > 1 && (
              <div 
                className="flex justify-between items-center mt-4 pt-4"
                style={{
                  borderTop: `1px solid ${currentTheme.borderColor}`
                }}
              >
                <button 
                  onClick={handlePrevPage} 
                  disabled={page === 1}
                  className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: currentTheme.highlightColor,
                    color: currentTheme.textColor,
                    borderRadius: currentTheme.borderRadius,
                    border: `1px solid ${currentTheme.borderColor}`
                  }}
                >
                  Previous
                </button>
                <span style={{ color: currentTheme.textColor }}>
                  Page {page} of {totalPages}
                </span>
                <button 
                  onClick={handleNextPage} 
                  disabled={page === totalPages}
                  className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: currentTheme.highlightColor,
                    color: currentTheme.textColor,
                    borderRadius: currentTheme.borderRadius,
                    border: `1px solid ${currentTheme.borderColor}`
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}