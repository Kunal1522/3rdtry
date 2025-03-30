import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Define the default theme (modern style as base, no terminal elements)
const defaultTheme = {
  id: 'default',
  name: 'Modern Mint',
  description: 'Clean and modern UI with a refreshing mint palette',
  cost: 0,
  // Core styles
  backgroundColor: '#f8f9fa',
  textColor: '#2d3748',
  accentColor: '#38b2ac',
  borderColor: 'rgba(56, 178, 172, 0.3)',
  primaryColor: '#38b2ac',
  secondaryColor: '#2c7a7b',
  highlightColor: 'rgba(56, 178, 172, 0.1)',
  // UI specific styles
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
  borderRadius: '0.5rem',
  buttonStyle: 'modern',
  cardBgColor: '#ffffff',
  headerBgColor: '#f8f9fa',
  footerBgColor: '#f1f5f9',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  glassEffect: false,
  backgroundImage: 'none',
  animation: 'fade',
  specialEffect: 'none',
  isTerminal: false,
  // Navigation and layout
  navStyle: 'modern',
  cardStyle: 'flat',
  progressBarStyle: 'gradient',
  headingStyle: 'modern',
  buttonBorderStyle: '1px solid rgba(56, 178, 172, 0.3)',
  buttonHoverEffect: 'scale',
  inputStyle: 'modern',
  // Element modifiers
  dividerStyle: 'solid',
  // Modern UI components
  componentStyle: 'clean',
  iconStyle: 'rounded',
  modalStyle: 'modern',
  tooltipStyle: 'popup'
};

// All available themes with completely different visual styles - NO TERMINAL UI
const themes = [
  defaultTheme,
  {
    id: 'heroes_journey',
    name: '🏆 Hero\'s Journey',
    description: 'A medieval adventure theme with parchment textures and gold accents',
    cost: 100,
    // Core colors
    backgroundColor: '#f8f0e3',
    textColor: '#3a2921',
    accentColor: '#c19a49',
    borderColor: '#8a5a44',
    primaryColor: '#8a5a44',
    secondaryColor: '#c19a49',
    highlightColor: 'rgba(193, 154, 73, 0.2)',
    // UI specific
    fontFamily: "'Cinzel', 'Times New Roman', serif",
    borderRadius: '8px',
    buttonStyle: 'embossed',
    cardBgColor: '#f4ead7',
    headerBgColor: '#d9c7a8',
    footerBgColor: '#d9c7a8',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    glassEffect: false,
    backgroundImage: "url('https://i.imgur.com/ZNZ2bv1.jpg')",
    animation: 'smooth-fade',
    specialEffect: 'parchment',
    isTerminal: false,
    // Navigation and layout
    navStyle: 'medieval',
    cardStyle: 'parchment',
    progressBarStyle: 'wooden',
    headingStyle: 'medieval',
    buttonBorderStyle: '2px solid #8a5a44',
    buttonHoverEffect: 'emboss',
    inputStyle: 'scroll',
    // Element modifiers
    dividerStyle: 'ornate',
    // Modern UI components
    componentStyle: 'wooden',
    iconStyle: 'medieval',
    modalStyle: 'scroll',
    tooltipStyle: 'parchment',
    // Custom theme-specific properties
    customCursor: "url('https://i.imgur.com/XYZabc.png'), auto",
    customScrollbar: true,
    leaderboardStyle: 'scrolls',
    tableStyle: 'wooden',
    // Modern UI overrides - NO TERMINAL ELEMENTS
    buttonLabel: {
      refresh: "Seek New Quest",
      markSolved: "Quest Complete",
      themes: "Royal Wardrobe",
      home: "Return to Castle",
      profile: "Hero's Journal"
    },
    headings: {
      problems: "Quests Available",
      leaderboard: "Hall of Heroes",
      xp: "Hero's Journey"
    }
  },
  {
    id: 'pixel_kingdom',
    name: '🕹 Pixel Kingdom',
    description: 'A retro 8-bit theme with pixelated backgrounds and arcade vibes',
    cost: 150,
    // Core colors
    backgroundColor: '#2a2a57',
    textColor: '#ffffff',
    accentColor: '#ff6b6b',
    borderColor: '#ffde59',
    primaryColor: '#3dd6f5',
    secondaryColor: '#ff6b6b',
    highlightColor: '#59ff59',
    // UI specific
    fontFamily: "'Press Start 2P', 'Courier New', monospace",
    borderRadius: '0',
    buttonStyle: 'pixel',
    cardBgColor: '#000033',
    headerBgColor: '#000044',
    footerBgColor: '#000044',
    boxShadow: 'none',
    glassEffect: false,
    backgroundImage: "url('https://i.imgur.com/Wj2Hkcm.png')",
    animation: 'pixel-transition',
    specialEffect: 'pixelated',
    isTerminal: false,
    // Navigation and layout
    navStyle: 'pixel',
    cardStyle: 'pixel-window',
    progressBarStyle: 'health-bar',
    headingStyle: 'pixel',
    buttonBorderStyle: '4px solid #ffde59',
    buttonHoverEffect: 'press',
    inputStyle: 'pixel',
    // Element modifiers
    dividerStyle: 'pixel',
    // Modern UI components
    componentStyle: 'pixel',
    iconStyle: 'pixel',
    modalStyle: 'game-dialog',
    tooltipStyle: 'speech-bubble',
    // Custom theme-specific properties
    customCursor: "url('https://i.imgur.com/def456.png'), auto",
    customScrollbar: true,
    leaderboardStyle: 'arcade',
    tableStyle: 'pixel',
    pixelBorderImage: "url('https://i.imgur.com/XYZabc.png') 5 / 5px repeat",
    // Modern UI overrides - NO TERMINAL ELEMENTS
    buttonLabel: {
      refresh: "NEW GAME",
      markSolved: "LEVEL UP!",
      themes: "CUSTOMIZE",
      home: "WORLD MAP",
      profile: "SAVE GAME"
    },
    headings: {
      problems: "CHALLENGES",
      leaderboard: "HIGH SCORES",
      xp: "PLAYER STATS"
    },
    soundEffects: {
      buttonClick: "https://example.com/pixel-click.mp3",
      success: "https://example.com/level-up.mp3"
    }
  },
  {
    id: 'sci_fi_command',
    name: '🚀 Sci-Fi Command',
    description: 'High-tech UI with glowing neon panels and futuristic layout',
    cost: 200,
    // Core colors
    backgroundColor: '#06101f',
    textColor: '#7fdbff',
    accentColor: '#ff0055',
    borderColor: 'rgba(127, 219, 255, 0.3)',
    primaryColor: '#7fdbff',
    secondaryColor: '#ff0055',
    highlightColor: 'rgba(127, 219, 255, 0.1)',
    // UI specific
    fontFamily: "'Orbitron', 'Arial', sans-serif",
    borderRadius: '4px',
    buttonStyle: 'glowing',
    cardBgColor: 'rgba(16, 24, 48, 0.8)',
    headerBgColor: 'rgba(6, 16, 31, 0.9)',
    footerBgColor: 'rgba(6, 16, 31, 0.9)',
    boxShadow: '0 0 15px rgba(127, 219, 255, 0.2)',
    glassEffect: true,
    backgroundImage: "url('https://i.imgur.com/JbaPLRY.jpg')",
    animation: 'glow-pulse',
    specialEffect: 'hologram',
    isTerminal: false,
    // Navigation and layout
    navStyle: 'tech',
    cardStyle: 'holographic',
    progressBarStyle: 'energy',
    headingStyle: 'tech',
    buttonBorderStyle: '1px solid rgba(127, 219, 255, 0.6)',
    buttonHoverEffect: 'glow',
    inputStyle: 'tech',
    // Element modifiers
    dividerStyle: 'tech',
    // Modern UI components
    componentStyle: 'holographic',
    iconStyle: 'tech',
    modalStyle: 'hologram',
    tooltipStyle: 'data-display',
    // Custom theme-specific properties
    customCursor: "url('https://i.imgur.com/ghi789.png'), auto",
    customScrollbar: true,
    leaderboardStyle: 'hologram',
    tableStyle: 'tech',
    gradientOverlay: 'linear-gradient(135deg, rgba(127, 219, 255, 0.1), rgba(255, 0, 85, 0.1))',
    // Modern UI overrides - NO TERMINAL ELEMENTS
    buttonLabel: {
      refresh: "Scan Database",
      markSolved: "Complete Mission",
      themes: "System Settings",
      home: "Command Center",
      profile: "User Profile"
    },
    headings: {
      problems: "Active Missions",
      leaderboard: "Combat Records",
      xp: "Neural Network"
    },
    animations: {
      loadingSpinner: "holographic-scan",
      buttonHover: "energy-pulse"
    }
  },
  {
    id: 'treasure_hunter',
    name: '🏴‍☠️ Treasure Hunter',
    description: 'Pirate-themed aesthetic with aged paper and weathered wood',
    cost: 250,
    // Core colors
    backgroundColor: '#382a1d',
    textColor: '#e6bc6c',
    accentColor: '#1a6a8b',
    borderColor: '#7a5c3d',
    primaryColor: '#e6bc6c',
    secondaryColor: '#1a6a8b',
    highlightColor: 'rgba(230, 188, 108, 0.2)',
    // UI specific
    fontFamily: "'Pirata One', 'Georgia', serif",
    borderRadius: '0',
    buttonStyle: 'weathered',
    cardBgColor: '#483224',
    headerBgColor: '#23150d',
    footerBgColor: '#23150d',
    boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)',
    glassEffect: false,
    backgroundImage: "url('https://i.imgur.com/BvA8AU9.jpg')",
    animation: 'wave-rock',
    specialEffect: 'treasure-map',
    isTerminal: false,
    // Navigation and layout
    navStyle: 'pirate',
    cardStyle: 'treasure-map',
    progressBarStyle: 'rum',
    headingStyle: 'pirate',
    buttonBorderStyle: '2px solid #7a5c3d',
    buttonHoverEffect: 'ripple',
    inputStyle: 'parchment',
    // Element modifiers
    dividerStyle: 'rope',
    // Modern UI components
    componentStyle: 'weathered',
    iconStyle: 'pirate',
    modalStyle: 'treasure-map',
    tooltipStyle: 'scroll',
    // Custom theme-specific properties
    customCursor: "url('https://i.imgur.com/jkl012.png'), auto",
    customScrollbar: true,
    leaderboardStyle: 'wanted-poster',
    tableStyle: 'aged-wood',
    woodTexture: "url('https://i.imgur.com/XYZabc.png')",
    // Modern UI overrides - NO TERMINAL ELEMENTS
    buttonLabel: {
      refresh: "New Voyage",
      markSolved: "Claim Bounty",
      themes: "Ship's Quarters",
      home: "Captain's Quarters",
      profile: "Sailor's Log"
    },
    headings: {
      problems: "Treasures to Find",
      leaderboard: "Pirate's Hall of Fame",
      xp: "Sailor's Journey"
    }
  },
  {
    id: 'dark_overlord',
    name: '🎭 Dark Overlord',
    description: 'Mysterious villain-themed design with crimson and obsidian',
    cost: 300,
    // Core colors
    backgroundColor: '#0e0e0e',
    textColor: '#c9c9c9',
    accentColor: '#a30000',
    borderColor: '#530000',
    primaryColor: '#ff2222',
    secondaryColor: '#222222',
    highlightColor: 'rgba(255, 0, 0, 0.1)',
    // UI specific
    fontFamily: "'Crimson Text', 'Times New Roman', serif",
    borderRadius: '2px',
    buttonStyle: 'sharp',
    cardBgColor: '#1a1a1a',
    headerBgColor: '#0a0a0a',
    footerBgColor: '#0a0a0a',
    boxShadow: '0 4px 8px rgba(255, 0, 0, 0.15)',
    glassEffect: false,
    backgroundImage: "url('https://i.imgur.com/cTMCJ4E.jpg')",
    animation: 'dark-pulse',
    specialEffect: 'smoke',
    isTerminal: false,
    // Navigation and layout
    navStyle: 'villain',
    cardStyle: 'black-metal',
    progressBarStyle: 'blood',
    headingStyle: 'gothic',
    buttonBorderStyle: '1px solid #530000',
    buttonHoverEffect: 'evil-glow',
    inputStyle: 'dark',
    // Element modifiers
    dividerStyle: 'spike',
    // Modern UI components
    componentStyle: 'dark',
    iconStyle: 'evil',
    modalStyle: 'dark-ritual',
    tooltipStyle: 'shadow',
    // Custom theme-specific properties
    customCursor: "url('https://i.imgur.com/mno345.png'), auto",
    customScrollbar: true,
    leaderboardStyle: 'dark-kingdom',
    tableStyle: 'evil-throne',
    smokeyBackground: true,
    // Modern UI overrides - NO TERMINAL ELEMENTS
    buttonLabel: {
      refresh: "Summon Challenge",
      markSolved: "Conquer",
      themes: "Dark Arts",
      home: "Dark Citadel",
      profile: "Book of Shadows"
    },
    headings: {
      problems: "Mortal Challenges",
      leaderboard: "Throne of Power",
      xp: "Path to Domination"
    }
  }
];

// Convert themes array to an object keyed by theme id for easier lookup
const THEMES = themes.reduce((acc, theme) => {
  acc[theme.id] = theme;
  return acc;
}, {});

// Create the context
const ThemeContext = createContext();

// Create a provider component
export const ThemeProvider = ({ children, handle }) => {
  // Load the active theme from local storage or use default
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedThemeId = localStorage.getItem('activeTheme');
    if (savedThemeId) {
      const foundTheme = themes.find(theme => theme.id === savedThemeId);
      return foundTheme || defaultTheme;
    }
    return defaultTheme;
  });
  
  // Track owned themes
  const [ownedThemes, setOwnedThemes] = useState(() => {
    const saved = localStorage.getItem('ownedThemes');
    return saved ? JSON.parse(saved) : ['default'];
  });
  
  // User XP
  const [userXP, setUserXP] = useState(0);
  const [loadingXP, setLoadingXP] = useState(true);
  
  // Load user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingXP(true);
        const response = await axios.get(`http://localhost:5000/api/users/${handle}`);
        setUserXP(response.data.experience || 0);
      } catch (error) {
        console.error('Failed to fetch user XP:', error);
      } finally {
        setLoadingXP(false);
      }
    };
    
    fetchUserData();
  }, [handle]);
  
  // Apply CSS custom properties when theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Base theme colors
    root.style.setProperty('--background', currentTheme.backgroundColor);
    root.style.setProperty('--text', currentTheme.textColor);
    root.style.setProperty('--accent', currentTheme.accentColor);
    root.style.setProperty('--border', currentTheme.borderColor);
    root.style.setProperty('--primary', currentTheme.primaryColor);
    root.style.setProperty('--secondary', currentTheme.secondaryColor);
    root.style.setProperty('--highlight', currentTheme.highlightColor);
    
    // UI specific styles
    root.style.setProperty('--font-family', currentTheme.fontFamily);
    root.style.setProperty('--border-radius', currentTheme.borderRadius);
    root.style.setProperty('--card-bg', currentTheme.cardBgColor);
    root.style.setProperty('--header-bg', currentTheme.headerBgColor);
    root.style.setProperty('--footer-bg', currentTheme.footerBgColor);
    root.style.setProperty('--box-shadow', currentTheme.boxShadow);
    root.style.setProperty('--button-style', currentTheme.buttonStyle);
    root.style.setProperty('--background-image', currentTheme.backgroundImage);
    
    // Navigation and layout styles
    root.style.setProperty('--nav-style', currentTheme.navStyle);
    root.style.setProperty('--card-style', currentTheme.cardStyle);
    root.style.setProperty('--progress-bar-style', currentTheme.progressBarStyle);
    root.style.setProperty('--heading-style', currentTheme.headingStyle);
    root.style.setProperty('--button-border-style', currentTheme.buttonBorderStyle);
    root.style.setProperty('--button-hover-effect', currentTheme.buttonHoverEffect);
    root.style.setProperty('--input-style', currentTheme.inputStyle);
    root.style.setProperty('--divider-style', currentTheme.dividerStyle);
    
    // Modern UI component styles
    root.style.setProperty('--component-style', currentTheme.componentStyle);
    root.style.setProperty('--icon-style', currentTheme.iconStyle);
    root.style.setProperty('--modal-style', currentTheme.modalStyle);
    root.style.setProperty('--tooltip-style', currentTheme.tooltipStyle);
    
    // Custom theme-specific properties
    if (currentTheme.customCursor) {
      root.style.setProperty('--custom-cursor', currentTheme.customCursor);
    }
    if (currentTheme.gradientOverlay) {
      root.style.setProperty('--gradient-overlay', currentTheme.gradientOverlay);
    }
    if (currentTheme.pixelBorderImage) {
      root.style.setProperty('--pixel-border-image', currentTheme.pixelBorderImage);
    }
    if (currentTheme.woodTexture) {
      root.style.setProperty('--wood-texture', currentTheme.woodTexture);
    }
    
    // Apply special themed body class
    document.body.className = '';
    document.body.classList.add(`theme-${currentTheme.id}`);
    
    // Apply special effects
    if (currentTheme.specialEffect) {
      document.body.classList.add(`effect-${currentTheme.specialEffect}`);
    }
    
    if (currentTheme.glassEffect) {
      document.body.classList.add('glass-effect');
    } else {
      document.body.classList.remove('glass-effect');
    }
    
    if (currentTheme.customScrollbar) {
      document.body.classList.add('custom-scrollbar');
    } else {
      document.body.classList.remove('custom-scrollbar');
    }
    
    if (currentTheme.smokeyBackground) {
      document.body.classList.add('smokey-bg');
    } else {
      document.body.classList.remove('smokey-bg');
    }
    
    // Apply animation class if specified
    if (currentTheme.animation && currentTheme.animation !== 'none') {
      document.body.classList.add(`animation-${currentTheme.animation}`);
    }
    
    // Set body background image if any
    if (currentTheme.backgroundImage && currentTheme.backgroundImage !== 'none') {
      document.body.style.backgroundImage = currentTheme.backgroundImage;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = 'none';
    }
    
    // Save to local storage
    localStorage.setItem('activeTheme', currentTheme.id);
  }, [currentTheme]);
  
  // Save owned themes to local storage
  useEffect(() => {
    localStorage.setItem('ownedThemes', JSON.stringify(ownedThemes));
  }, [ownedThemes]);
  
  // Purchase and apply a theme
  const purchaseTheme = async (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return { success: false, message: 'Theme not found' };
    
    // Check if user has enough XP
    if (userXP < theme.cost) {
      return { success: false, message: 'Not enough XP to purchase this theme' };
    }
    
    try {
      // Deduct XP
      const response = await axios.put(`http://localhost:5000/api/users/${handle}/update`, {
        experience: -theme.cost
      });
      
      // Update local state
      setUserXP(prev => prev - theme.cost);
      
      // Add to owned themes if not already owned
      if (!ownedThemes.includes(themeId)) {
        setOwnedThemes(prev => [...prev, themeId]);
      }
      
      // Apply the theme
      setCurrentTheme(theme);
      
      return { 
        success: true, 
        message: `Successfully purchased and applied ${theme.name} theme!`,
        newXP: userXP - theme.cost
      };
    } catch (error) {
      console.error('Error purchasing theme:', error);
      return { success: false, message: 'Failed to purchase theme. Please try again.' };
    }
  };
  
  // Switch to an already owned theme
  const switchTheme = async (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return { success: false, message: 'Theme not found' };
    
    // Check if this is a non-default theme that has a switch cost
    if (themeId !== 'default' && ownedThemes.includes(themeId)) {
      const switchCost = Math.floor(theme.cost * 0.1); // 10% of original cost
      
      if (userXP < switchCost) {
        return { success: false, message: 'Not enough XP to switch to this theme' };
      }
      
      try {
        // Deduct the switching fee
        await axios.put(`http://localhost:5000/api/users/${handle}/update`, {
          experience: -switchCost
        });
        
        // Update local XP
        setUserXP(prev => prev - switchCost);
      } catch (error) {
        console.error('Error deducting switch cost:', error);
        return { success: false, message: 'Failed to switch theme. Please try again.' };
      }
    }
    
    // Apply the theme
    setCurrentTheme(theme);
    
    return { 
      success: true, 
      message: `Successfully switched to ${theme.name} theme!`
    };
  };
  
  return (
    <ThemeContext.Provider 
      value={{ 
        themes, 
        currentTheme, 
        ownedThemes, 
        userXP,
        loadingXP,
        setUserXP,
        purchaseTheme,
        switchTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme context
export const useTheme = () => useContext(ThemeContext);

// Export the themes object
export { THEMES };