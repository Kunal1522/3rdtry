import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

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
const DailySummaryCard = ({ date, totalXP, entries, dayNumber, isHighest, isToday, handle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className={`border border-green-500/30 p-3 mb-2 bg-black font-mono ${isHighest ? 'border-yellow-500/50' : ''} ${isToday ? 'border-green-500/70' : ''}`}
    >
      {/* Header with date and total XP - made responsive */}
      <div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer gap-2 sm:gap-0" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-wrap items-center gap-2 max-w-full">
          <span className="text-green-700">$</span>
          <span className="text-green-400 text-sm sm:text-base truncate">{handle}_day_{dayNumber}</span>
          <span className="text-green-700 text-xs">~{date}</span>
          <div className="flex gap-1 flex-wrap">
            {isHighest && (
              <span className="text-yellow-500 text-xs whitespace-nowrap">[best]</span>
            )}
            {isToday && (
              <span className="text-green-500 text-xs whitespace-nowrap">[today]</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
          <div className="px-2 py-0.5 border border-green-500/30 text-green-400 text-xs sm:text-sm whitespace-nowrap">
            +{totalXP} XP
          </div>
          <button className="text-green-400 px-1 min-w-8 flex-shrink-0">
            {isExpanded ? '-' : '+'}
          </button>
        </div>
      </div>
      
      {/* Expandable problem details - made responsive */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 pl-2 sm:pl-4 border-l border-green-500/30">
              {entries.map((entry) => (
                <div key={entry._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs gap-1 sm:gap-0 pb-2 border-b border-green-500/10 last:border-0">
                  <div className="max-w-full overflow-hidden">
                    <span className="text-green-400 block truncate">{entry.problemName}</span>
                    <div className="text-green-700 text-[10px] sm:text-xs">
                      <span className="inline-block truncate">Problem {entry.problemId}</span> | {formatDateTime(entry.date)}
                    </div>
                  </div>
                  <div className="px-2 py-0.5 border border-green-500/30 text-xs whitespace-nowrap self-start sm:self-center mt-1 sm:mt-0">
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

export default function Leaderboard({ handle }) {
  const [entries, setEntries] = useState([]);
  const [groupedByDate, setGroupedByDate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dailySummary, setDailySummary] = useState(null);

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
    
    // Convert to array and sort by date chronologically
    const sortedDays = Object.values(groups).sort((a, b) => {
      return a.rawDate - b.rawDate; // Sort by date (oldest first)
    });
    
    // Add day numbers (chronologically - first day is day 1)
    let dayCounter = 1;
    sortedDays.forEach(day => {
      day.dayNumber = dayCounter++;
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
    <div className="border border-green-500/30 p-4 bg-black">
      <div className="mb-4">
        <h2 className="text-md font-bold border-b border-green-500/50 pb-1 text-green-400">
          $ ./user_progress.sh --handle={handle}
        </h2>
      </div>
      
      {dailySummary && (
        <div className="border border-green-500/20 p-3 mb-4 font-mono">
          <div className="text-xs text-green-700">$ cat today.log</div>
          <div className="text-lg font-bold text-green-400 mt-1">
            <span className="text-green-700">daily_xp:</span> +{dailySummary.dailyXP} XP
          </div>
          <div className="text-xs text-green-700 mt-1">$ echo "Beat your personal best!"</div>
        </div>
      )}
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-6 text-green-400">
          <div className="loading-spinner mb-3"></div>
          <p>$ Loading progress data... <span className="animate-pulse">_</span></p>
        </div>
      ) : error ? (
        <div className="text-red-400 py-4 font-mono">
          <span className="text-red-700">$ error:</span> {error}
        </div>
      ) : groupedByDate.length === 0 ? (
        <div className="py-4 font-mono text-green-400">
          <div className="text-green-700">$ cat progress.log</div>
          <p className="mt-2">No data found. Solve problems to start tracking your progress.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 font-mono">
            <div className="text-xs text-green-700 mb-1">$ cat legend.txt</div>
            <div className="text-xs border border-green-500/20 p-2 bg-black">
              {highestXPDay && (
                <div className="text-yellow-500">
                  [best] <span className="text-green-400">→ Your highest XP day</span>
                </div>
              )}
              <div className="text-green-500">
                [today] <span className="text-green-400">→ Today's progress</span>
              </div>
            </div>
          </div>
          
          <div className="mb-4 font-mono">
            <div className="text-xs text-green-700 mb-1">$ ls -la daily/</div>
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
                />
              ))}
            </AnimatePresence>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-green-500/30">
              <button 
                onClick={handlePrevPage} 
                disabled={page === 1}
                className="px-3 py-1 border border-green-500/30 text-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                $ prev_page
              </button>
              <span className="text-green-400">
                page {page}/{totalPages}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={page === totalPages}
                className="px-3 py-1 border border-green-500/30 text-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                $ next_page
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}