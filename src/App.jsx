import { useState, useEffect } from 'react'
import './App.css'
import { createBrowserRouter, RouterProvider, Route, Link, Outlet, NavLink, useOutletContext } from 'react-router-dom'
import FetchCodeforces from './fetchData'
import { Toaster } from "react-hot-toast"
import XPDisplay from './xpbar'
import Leaderboard from './Leaderboard'
import ThemeMarketplace from './ThemeMarketplace'
import SideQuests from './SideQuests'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import UserStatsComponent from './components/UserStatsComponent'
import axios from 'axios'

// Layout Component with modern UI header and footer
const Layout = ({ handle }) => {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [systemStatus, setSystemStatus] = useState("Online")
  const { currentTheme } = useTheme();
  
  useEffect(() => {
    // Modern loading states
    const bootSequence = [
      "Connecting...",
      "Loading user data...",
      "Establishing connection...",
      "Ready",
      "Online"
    ];
    
    let i = 0;
    const statusInterval = setInterval(() => {
      setSystemStatus(bootSequence[i]);
      i++;
      if (i >= bootSequence.length) clearInterval(statusInterval);
    }, 600);
    
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${handle}`)
        setUserData(response.data)
      } catch (error) {
        console.error("Failed to fetch user data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
    
    return () => clearInterval(statusInterval);
  }, [handle])
  
  // Get theme-specific button labels
  const buttonLabels = currentTheme.buttonLabel || {};
  
  return (
    <div className="min-h-screen" style={{ 
      fontFamily: currentTheme.fontFamily,
      backgroundColor: currentTheme.backgroundColor,
      color: currentTheme.textColor
    }}>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: currentTheme.cardBgColor,
            color: currentTheme.textColor,
            fontFamily: currentTheme.fontFamily,
            border: `1px solid ${currentTheme.borderColor}`,
            borderRadius: currentTheme.borderRadius,
          },
        }}
      />
      
      <header className="py-4 shadow-md" style={{ 
        backgroundColor: currentTheme.headerBgColor,
        borderBottom: `1px solid ${currentTheme.borderColor}`
      }}>
        <div className="container mx-auto px-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="logo-badge" style={{ 
              backgroundColor: currentTheme.primaryColor,
              color: currentTheme.cardBgColor,
              borderRadius: currentTheme.borderRadius,
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.5rem',
              height: '2.5rem'
            }}>
              <span className="font-bold text-lg">CF</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: currentTheme.primaryColor }}>
              Codeforces Upsolve
            </h1>
          </div>
          
          {/* Modern Navigation Links */}
          <nav className="flex gap-4">
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                backgroundColor: isActive ? currentTheme.highlightColor : 'transparent',
                color: isActive ? currentTheme.primaryColor : currentTheme.textColor,
                padding: '0.5rem 1rem',
                borderRadius: currentTheme.borderRadius,
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'all 0.3s ease'
              })}
            >
              {buttonLabels.home || "Home"}
            </NavLink>
            <NavLink 
              to="/side-quests" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                backgroundColor: isActive ? currentTheme.highlightColor : 'transparent',
                color: isActive ? currentTheme.primaryColor : currentTheme.textColor,
                padding: '0.5rem 1rem',
                borderRadius: currentTheme.borderRadius,
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'all 0.3s ease'
              })}
            >
              {buttonLabels.quests || "Side Quests"}
            </NavLink>
            <NavLink 
              to="/themes-marketplace" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                backgroundColor: isActive ? currentTheme.highlightColor : 'transparent',
                color: isActive ? currentTheme.primaryColor : currentTheme.textColor,
                padding: '0.5rem 1rem',
                borderRadius: currentTheme.borderRadius,
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'all 0.3s ease'
              })}
            >
              {buttonLabels.themes || "Themes"}
            </NavLink>
          </nav>
          
          <div className="flex items-center gap-3">
            <div className="user-badge" style={{ 
              backgroundColor: currentTheme.highlightColor,
              color: currentTheme.textColor,
              padding: '0.5rem 0.75rem',
              borderRadius: currentTheme.borderRadius,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span className="font-medium">{handle}</span>
            </div>
            <div className="status-indicator" style={{ 
              padding: '0.5rem 0.75rem',
              backgroundColor: 'transparent',
              borderRadius: currentTheme.borderRadius,
              border: `1px solid ${currentTheme.borderColor}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span 
                className="status-dot" 
                style={{ 
                  display: 'inline-block',
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '50%',
                  backgroundColor: currentTheme.accentColor,
                  animation: 'pulse 2s infinite'
                }}
              ></span>
              <span className="text-sm">{systemStatus}</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <Outlet context={{ handle, userData, loading }} />
      </main>
      
      <footer style={{ 
        backgroundColor: currentTheme.footerBgColor,
        borderTop: `1px solid ${currentTheme.borderColor}`,
        padding: '1rem 0',
        marginTop: '2rem'
      }}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="status-badge" style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <span 
              className="status-indicator" 
              style={{ 
                display: 'inline-block',
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                backgroundColor: currentTheme.accentColor
              }}
            ></span>
            <span>System Status: Optimal</span>
          </div>
          <p style={{ fontSize: '0.875rem' }}>
            © {new Date().getFullYear()} Codeforces Companion
          </p>
        </div>
      </footer>
    </div>
  );
};

// Home Page Component with tabs (modern UI)
const HomePage = () => {
  const [activeTab, setActiveTab] = useState("problems"); // "problems" or "leaderboard"
  const { handle, userData, loading } = useOutletContext();
  const { currentTheme } = useTheme();
  
  // Get theme-specific headings
  const headings = currentTheme.headings || {};
  
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* User Stats Section - Modern UI */}
      <aside className="w-full md:w-1/4 lg:w-1/5">
        {loading ? (
          <div className="loading-card" style={{
            backgroundColor: currentTheme.cardBgColor,
            borderRadius: currentTheme.borderRadius,
            padding: '1.5rem',
            boxShadow: currentTheme.boxShadow,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px'
          }}>
            <div className="loading-spinner" style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              border: `3px solid ${currentTheme.borderColor}`,
              borderTopColor: currentTheme.primaryColor,
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : userData ? (
          <UserStatsComponent userData={userData} />
        ) : (
          <div className="error-card" style={{
            backgroundColor: currentTheme.cardBgColor,
            borderRadius: currentTheme.borderRadius,
            padding: '1.5rem',
            boxShadow: currentTheme.boxShadow,
            color: '#ff6b6b',
            textAlign: 'center'
          }}>
            <div className="error-icon" style={{
              fontSize: '2rem',
              marginBottom: '0.5rem'
            }}>⚠️</div>
            <p>User data not found</p>
          </div>
        )}
      </aside>
      
      {/* Main Content Area */}
      <section className="w-full md:w-3/4 lg:w-4/5">
        {/* Tabs Navigation - Modern UI */}
        <div className="tabs-container" style={{
          display: 'flex',
          borderBottom: `1px solid ${currentTheme.borderColor}`,
          marginBottom: '1.5rem'
        }}>
          <button 
            onClick={() => setActiveTab("problems")}
            className="tab-button"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeTab === "problems" ? currentTheme.highlightColor : 'transparent',
              color: activeTab === "problems" ? currentTheme.primaryColor : currentTheme.textColor,
              fontWeight: activeTab === "problems" ? 'bold' : 'normal',
              borderBottom: activeTab === "problems" ? `2px solid ${currentTheme.primaryColor}` : 'none',
              borderTopLeftRadius: currentTheme.borderRadius,
              borderTopRightRadius: currentTheme.borderRadius,
              transition: 'all 0.3s ease'
            }}
          >
            {headings.problems || "Problems"}
          </button>
          <button 
            onClick={() => setActiveTab("leaderboard")}
            className="tab-button"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: activeTab === "leaderboard" ? currentTheme.highlightColor : 'transparent',
              color: activeTab === "leaderboard" ? currentTheme.primaryColor : currentTheme.textColor,
              fontWeight: activeTab === "leaderboard" ? 'bold' : 'normal',
              borderBottom: activeTab === "leaderboard" ? `2px solid ${currentTheme.primaryColor}` : 'none',
              borderTopLeftRadius: currentTheme.borderRadius,
              borderTopRightRadius: currentTheme.borderRadius,
              transition: 'all 0.3s ease'
            }}
          >
            {headings.leaderboard || "Leaderboard"}
          </button>
        </div>
        
        {/* Tab Content - Modern UI */}
        <div className="tab-content" style={{
          backgroundColor: currentTheme.cardBgColor,
          borderRadius: currentTheme.borderRadius,
          padding: '1.5rem',
          boxShadow: currentTheme.boxShadow
        }}>
          {activeTab === "problems" ? (
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: currentTheme.textColor,
                borderBottom: `1px solid ${currentTheme.borderColor}`,
                paddingBottom: '0.5rem'
              }}>
                {headings.problems || "Available Problems"}
              </h2>
              <FetchCodeforces handle={handle} />
            </div>
          ) : (
            <Leaderboard handle={handle} />
          )}
        </div>
      </section>
    </div>
  );
}

// Theme Marketplace Page - just a wrapper for the ThemeMarketplace component
const ThemesPage = () => {
  const { handle } = useOutletContext();
  return <ThemeMarketplace handle={handle} />;
};

// Side Quests Page - wrapper for the SideQuests component
const SideQuestsPage = () => {
  const { handle } = useOutletContext();
  return <SideQuests handle={handle} />;
};

// Create router with routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout handle="sikki_pehlwan" />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "themes-marketplace",
        element: <ThemesPage />
      },
      {
        path: "side-quests",
        element: <SideQuestsPage />
      }
    ]
  }
]);

function App() {
  const handle = "sikki_pehlwan"; // You might want to make this configurable later
  return (
    <ThemeProvider handle={handle}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
