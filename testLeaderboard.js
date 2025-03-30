import React from 'react';
import ReactDOM from 'react-dom/client';
import Leaderboard from './src/Leaderboard.jsx';
import './src/index.css';
import axios from 'axios';

// Mock the axios requests
axios.get = async (url) => {
  console.log('Mocked API call to:', url);  
  // Mock data for leaderboard entries
  if (url.includes('/api/leaderboard')) {
    return {
      data: {
        entries: [
          {
            _id: '1',
            handle: 'testUser',
            problemId: 'problem1',
            problemName: 'Two Sum',
            xpGained: 50,
            date: new Date(2023, 6, 1, 14, 30).toISOString() // July 1, 2023
          },
          {
            _id: '2',
            handle: 'testUser',
            problemId: 'problem2',
            problemName: 'Three Sum',
            xpGained: 75,
            date: new Date(2023, 6, 1, 16, 45).toISOString() // July 1, 2023
          },
          {
            _id: '3',
            handle: 'testUser',
            problemId: 'problem3',
            problemName: 'Valid Parentheses',
            xpGained: 30,
            date: new Date(2023, 6, 2, 9, 15).toISOString() // July 2, 2023
          },
          {
            _id: '4',
            handle: 'testUser',
            problemId: 'problem4',
            problemName: 'Merge Two Sorted Lists',
            xpGained: 40,
            date: new Date().toISOString() // Today
          },
          {
            _id: '5',
            handle: 'testUser',
            problemId: 'problem5',
            problemName: 'Reverse Linked List',
            xpGained: 60,
            date: new Date().toISOString() // Today
          }
        ],
        pagination: {
          pages: 1,
          total: 5
        }
      }
    };
  }

  // Mock data for daily XP
  if (url.includes('/api/users/')) {
    return {
      data: {
        dailyXP: 100,
        totalXP: 255,
        streak: 3
      }
    };
  }

  return { data: {} };
};

// Create root and render
const root = ReactDOM.createRoot(document.getElementById('root') || document.createElement('div'));
root.render(
  <React.StrictMode>
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Leaderboard Test</h1>
      <div className="max-w-3xl mx-auto">
        <Leaderboard handle="testUser" />
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded-lg max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">How to Test:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>This page uses mock data instead of real API calls</li>
          <li>You can modify the mock data in testLeaderboard.js to test different scenarios</li>
          <li>Change dates, XP values, or add more entries to test the component behavior</li>
          <li>Check if the "highest day" and "today" indicators show up correctly</li>
          <li>Test expanding/collapsing the daily entries by clicking on them</li>
        </ol>
      </div>
    </div>
  </React.StrictMode>
);