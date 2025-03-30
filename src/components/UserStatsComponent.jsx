import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import './UserStatsComponent.css';

// Define the progression tiers
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

// Function to get user's title based on XP
const getUserTitle = (experience) => {
  // Find the highest tier the user has reached
  const userTier = TIERS.reduce((highest, tier) => {
    if (experience >= tier.xp && tier.xp >= highest.xp) {
      return tier;
    }
    return highest;
  }, TIERS[0]);
  
  return userTier.title;
};

const UserStatsComponent = ({ userData }) => {
  const { currentTheme } = useTheme();
  const [dailyActivity, setDailyActivity] = useState({
    problemsSolved: 0,
    xpEarned: 0,
    loading: true
  });
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key
  
  // Function to refresh activity data
  const refreshActivityData = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  useEffect(() => {
    // Fetch today's activity data when component mounts or when refreshed
    const fetchDailyActivity = async () => {
      if (!userData || !userData.handle) return;
      
      setDailyActivity(prev => ({ ...prev, loading: true }));
      
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${userData.handle}/daily-activity`);
        
        setDailyActivity({
          problemsSolved: response.data.problemsSolved || 0,
          xpEarned: response.data.xpEarned || 0,
          loading: false
        });
        
        console.log('Daily activity fetched:', response.data);
      } catch (error) {
        console.error('Failed to fetch daily activity:', error);
        setDailyActivity(prev => ({
          ...prev,
          loading: false
        }));
      }
    };
    
    fetchDailyActivity();
    
    // Set up an interval to refresh activity data every minute
    const refreshInterval = setInterval(refreshActivityData, 60000);
    
    return () => clearInterval(refreshInterval);
  }, [userData, refreshKey]); // Add refreshKey to dependencies
  
  if (!userData) return null;
  
  const { handle, experience, maxExperience } = userData;
  
  // Get the user's title based on their experience
  const title = getUserTitle(experience);
  
  // Calculate progress percentage
  const progressPercentage = Math.floor((experience / maxExperience) * 100);
  const remainingXP = maxExperience - experience;
  
  // Use theme-specific labels if available
  const headings = currentTheme.headings || {};
  
  // Format XP with sign
  const formattedXP = dailyActivity.xpEarned > 0 
    ? `+${dailyActivity.xpEarned}` 
    : dailyActivity.xpEarned.toString();
  
  return (
    <div className={`user-stats-container theme-${currentTheme.id}`}>
      {/* User Profile Card */}
      <div className="user-profile-card">
        <div className="user-avatar">
          <div className="avatar-placeholder">
            {handle.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="user-details">
          <h2 className="user-handle">{handle}</h2>
          <div className="user-title">{title}</div>
        </div>
      </div>
      
      {/* XP Progress Section */}
      <div className="xp-progress-section">
        <h3 className="xp-heading">{headings.xp || "Experience Progress"}</h3>
        
        <div className="xp-numbers">
          <span className="current-xp">{experience}</span>
          <span className="max-xp">/ {maxExperience}</span>
        </div>
        
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="remaining-xp">
          <div className="xp-chip">
            <span className="xp-value">{remainingXP}</span>
            <span className="xp-label">XP needed for next level</span>
          </div>
        </div>
      </div>
      
      {/* Daily Activity Summary */}
      <div className="daily-activity-card">
        <div className="daily-header">
          <h3 className="daily-heading">Today's Activity</h3>
          <button 
            className="refresh-button" 
            onClick={refreshActivityData}
            aria-label="Refresh activity data"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: currentTheme.accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '50%'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" 
                fill="currentColor"/>
            </svg>
          </button>
        </div>
        
        {dailyActivity.loading ? (
          <div className="loading-activity">
            <div className="activity-spinner" style={{
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: '50%',
              border: `2px solid ${currentTheme.borderColor}`,
              borderTopColor: currentTheme.primaryColor,
              margin: '1rem auto',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : (
          <div className="daily-stats">
            <div className="stat-item">
              <span className="stat-label">Problems Solved</span>
              <span className="stat-value">{dailyActivity.problemsSolved}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">XP Earned</span>
              <span className="stat-value" style={{ 
                color: dailyActivity.xpEarned >= 0 ? 'var(--accent)' : '#ff6b6b' 
              }}>
                {formattedXP}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserStatsComponent;