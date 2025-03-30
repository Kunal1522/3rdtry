import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, THEMES } from './context/ThemeContext';
import { toast } from 'react-hot-toast';

// Theme Preview Modal Component
const ThemePreviewModal = ({ theme, isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="border p-6 bg-black max-w-4xl w-full mx-4 h-[80vh] overflow-y-auto"
        style={{ 
          borderColor: theme.primaryColor + '80',
          backgroundColor: theme.backgroundColor + 'f0',
          color: theme.textColor,
          fontFamily: theme.fontFamily
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b mb-4 pb-2" 
          style={{ borderColor: theme.borderColor }}>
          <h3 className="text-xl font-bold" style={{ color: theme.primaryColor }}>
            {theme.name} Preview
          </h3>
          <button 
            onClick={onClose}
            className="text-sm px-2 py-1"
            style={{ borderColor: theme.borderColor }}
          >
            $ close
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme Info Section */}
          <div>
            <div className="mb-4">
              <div className="text-sm mb-1" style={{ color: theme.accentColor }}>$ cat theme_info.md</div>
              <div className="border p-3" style={{ 
                borderColor: theme.borderColor,
                backgroundColor: theme.cardBgColor
              }}>
                <p className="mb-2" style={{ color: theme.textColor }}>{theme.description}</p>
                <div className="text-xs grid grid-cols-2 gap-2 mt-4">
                  <div>Theme ID: <span style={{ color: theme.primaryColor }}>{theme.id}</span></div>
                  <div>Cost: <span style={{ color: theme.primaryColor }}>{theme.cost} XP</span></div>
                  <div>Style: <span style={{ color: theme.primaryColor }}>{theme.specialEffect || 'Standard'}</span></div>
                  <div>Font: <span style={{ color: theme.primaryColor }}>{theme.fontFamily.split(',')[0].replace(/['"]/g, '')}</span></div>
                </div>
              </div>
            </div>
            
            {/* Color Palette */}
            <div className="mb-4">
              <div className="text-sm mb-1" style={{ color: theme.accentColor }}>$ cat color_palette.css</div>
              <div className="border p-3" style={{ 
                borderColor: theme.borderColor,
                backgroundColor: theme.cardBgColor
              }}>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries({
                    'Primary': theme.primaryColor,
                    'Secondary': theme.secondaryColor,
                    'Accent': theme.accentColor,
                    'Background': theme.backgroundColor,
                    'Text': theme.textColor,
                    'Border': theme.borderColor,
                    'Highlight': theme.highlightColor
                  }).map(([name, color]) => (
                    <div key={name} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                      <div className="text-xs">{name}: <span style={{ color: theme.primaryColor }}>{color}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* UI Examples Section */}
          <div>
            {/* Buttons */}
            <div className="mb-4">
              <div className="text-sm mb-1" style={{ color: theme.accentColor }}>$ cat buttons.jsx</div>
              <div className="border p-3" style={{ 
                borderColor: theme.borderColor,
                backgroundColor: theme.cardBgColor
              }}>
                <div className="flex flex-wrap gap-2 mb-2">
                  <button className="px-3 py-1 text-sm" style={{ 
                    backgroundColor: theme.primaryColor + '20',
                    borderColor: theme.primaryColor,
                    color: theme.textColor
                  }}>
                    $ primary
                  </button>
                  <button className="px-3 py-1 text-sm" style={{ 
                    backgroundColor: theme.secondaryColor + '20',
                    borderColor: theme.secondaryColor,
                    color: theme.textColor
                  }}>
                    $ secondary
                  </button>
                  <button className="px-3 py-1 text-sm" style={{ 
                    borderColor: theme.borderColor,
                    color: theme.textColor
                  }}>
                    $ basic
                  </button>
                </div>
              </div>
            </div>
            
            {/* Card Example */}
            <div className="mb-4">
              <div className="text-sm mb-1" style={{ color: theme.accentColor }}>$ cat card_component.jsx</div>
              <div className="border p-3" style={{ 
                borderColor: theme.borderColor,
                backgroundColor: theme.cardBgColor
              }}>
                <div className="border p-3" style={{ 
                  borderColor: theme.primaryColor,
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor
                }}>
                  <h4 className="font-bold mb-2" style={{ color: theme.primaryColor }}>Card Title</h4>
                  <p className="text-sm mb-3">This is how content would appear in a card with this theme applied.</p>
                  <div className="flex justify-end">
                    <button className="px-3 py-1 text-xs" style={{ 
                      borderColor: theme.borderColor,
                      color: theme.textColor
                    }}>
                      $ action
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="text-sm mb-1" style={{ color: theme.accentColor }}>$ cat progress_bar.jsx</div>
              <div className="border p-3" style={{ 
                borderColor: theme.borderColor,
                backgroundColor: theme.cardBgColor
              }}>
                <div className="text-xs mb-1">XP Progress:</div>
                <div className="h-4 w-full border overflow-hidden" style={{ 
                  borderColor: theme.borderColor,
                  backgroundColor: theme.backgroundColor
                }}>
                  <div className="h-full" style={{ 
                    width: '65%', 
                    backgroundColor: theme.primaryColor,
                    opacity: 0.8
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Theme Card Component to display individual themes
const ThemeCard = ({ theme, isOwned, onPurchase, onSwitch, isActive, userXP }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const canAfford = userXP >= theme.cost;
  
  // Determine switch cost (10% of original)
  const switchCost = Math.floor(theme.cost * 0.1);
  const canAffordSwitch = userXP >= switchCost;
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`border p-4 mb-4 relative ${
          isActive ? 'border-opacity-100' : 'border-opacity-30'
        }`}
        style={{ borderColor: theme.primaryColor, backgroundColor: theme.backgroundColor + '80' }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isActive && (
          <div 
            className="absolute top-2 right-2 px-2 py-1 text-xs"
            style={{ color: theme.primaryColor, border: `1px solid ${theme.borderColor}` }}
          >
            $ active_theme
          </div>
        )}
        
        <div className="mb-3">
          <h3 className="text-lg font-bold mb-1" style={{ color: theme.primaryColor }}>
            {theme.name}
          </h3>
          <p className="text-sm opacity-80" style={{ color: theme.textColor }}>
            {theme.description}
          </p>
        </div>
        
        <div 
          className="mb-4 cursor-pointer"
          onClick={() => setShowPreview(true)}
        >
          <div className="text-sm" style={{ color: theme.accentColor }}>
            $ cat theme_preview.sh
          </div>
          <div 
            className="h-16 w-full mt-1 flex items-center justify-center rounded-none overflow-hidden"
            style={{ 
              backgroundColor: theme.backgroundColor,
              border: `1px solid ${theme.borderColor}`
            }}
          >
            <div 
              className="text-center flex flex-col items-center"
              style={{ color: theme.textColor }}
            >
              <span style={{ color: theme.primaryColor }}>$ echo</span>
              <span>Theme Preview</span>
              <span className="text-xs mt-1" style={{ color: theme.accentColor }}>
                (Click for detailed preview)
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div>
            {theme.id !== 'default' && (
              <div className="text-sm opacity-80" style={{ color: theme.textColor }}>
                <span>Cost: </span>
                <span className="font-bold">{theme.cost} XP</span>
                {isOwned && theme.id !== 'default' && (
                  <div className="text-xs mt-1" style={{ color: theme.accentColor }}>
                    $ switch_fee: {switchCost} XP
                  </div>
                )}
              </div>
            )}
            
            {theme.id === 'default' && (
              <div className="text-sm" style={{ color: theme.textColor }}>
                <span>Default Theme (Free)</span>
              </div>
            )}
          </div>
          
          <div>
            {isOwned ? (
              <button
                onClick={() => onSwitch(theme.id)}
                disabled={isActive || (theme.id !== 'default' && !canAffordSwitch)}
                className="px-3 py-1 text-sm font-mono"
                style={{ 
                  borderColor: theme.borderColor,
                  color: theme.textColor,
                  opacity: isActive || (theme.id !== 'default' && !canAffordSwitch) ? 0.5 : 1
                }}
              >
                {isActive ? '$ active' : '$ switch'}
              </button>
            ) : (
              <button
                onClick={() => onPurchase(theme.id)}
                disabled={!canAfford}
                className="px-3 py-1 text-sm font-mono"
                style={{ 
                  borderColor: theme.borderColor,
                  color: theme.textColor,
                  opacity: canAfford ? 1 : 0.5
                }}
              >
                {canAfford ? '$ purchase' : '$ insufficient_xp'}
              </button>
            )}
          </div>
        </div>
        
        {isHovering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs"
            style={{ color: theme.primaryColor }}
          >
            {!isOwned && !canAfford && `$ error: Need ${theme.cost - userXP} more XP`}
            {isOwned && theme.id !== 'default' && !canAffordSwitch && !isActive && (
              `$ error: Need ${switchCost - userXP} more XP to switch`
            )}
          </motion.div>
        )}
      </motion.div>
      
      <AnimatePresence>
        {showPreview && (
          <ThemePreviewModal
            theme={theme}
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// Confirmation Dialog for Theme Actions
const ConfirmationDialog = ({ isOpen, onClose, title, message, onConfirm, confirmText, theme }) => {
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="border p-6 bg-black max-w-md w-full mx-4"
        style={{ 
          borderColor: theme.primaryColor + '80',
          backgroundColor: theme.backgroundColor + 'f0',
          color: theme.textColor
        }}
      >
        <h3 className="text-lg font-bold mb-4 pb-2 border-b" style={{ borderColor: theme.borderColor }}>
          {title}
        </h3>
        
        <div className="my-4" style={{ color: theme.textColor }}>
          <p>{message}</p>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2"
            style={{ borderColor: theme.borderColor }}
          >
            $ cancel
          </button>
          
          <button
            onClick={onConfirm}
            className="px-4 py-2"
            style={{ 
              borderColor: theme.primaryColor,
              backgroundColor: theme.primaryColor + '20'
            }}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Theme Marketplace Component
const ThemeMarketplace = ({ handle }) => {
  const { 
    currentTheme, 
    ownedThemes, 
    userXP, 
    purchaseTheme, 
    switchTheme, 
    loadingXP 
  } = useTheme();
  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: '',
    themeId: null
  });
  
  // Handle Theme Purchase
  const handlePurchase = (themeId) => {
    const theme = THEMES[themeId];
    if (!theme) return;
    
    setConfirmDialog({
      isOpen: true,
      title: `$ purchase_theme.sh --theme="${theme.name}"`,
      message: `Are you sure you want to purchase ${theme.name} for ${theme.cost} XP?`,
      confirmText: '$ confirm_purchase',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        
        const result = await purchaseTheme(themeId);
        if (result.success) {
          toast.success(`$ Theme purchased and applied!`);
        } else {
          toast.error(`$ error: ${result.message}`);
        }
      },
      themeId
    });
  };
  
  // Handle Theme Switch
  const handleSwitch = (themeId) => {
    const theme = THEMES[themeId];
    if (!theme) return;
    
    // Default theme doesn't require confirmation
    if (themeId === 'default') {
      switchTheme(themeId)
        .then(result => {
          if (result.success) {
            toast.success('$ Switched to default theme');
          } else {
            toast.error(`$ error: ${result.message}`);
          }
        });
      return;
    }
    
    const switchCost = Math.floor(theme.cost * 0.1); // 10% of original cost
    
    setConfirmDialog({
      isOpen: true,
      title: `$ switch_theme.sh --theme="${theme.name}"`,
      message: `Switching to ${theme.name} will cost ${switchCost} XP. Continue?`,
      confirmText: '$ confirm_switch',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        
        const result = await switchTheme(themeId);
        if (result.success) {
          toast.success(`$ Theme applied successfully!`);
        } else {
          toast.error(`$ error: ${result.message}`);
        }
      },
      themeId
    });
  };
  
  // Sort themes: first active, then owned, then by cost
  const sortedThemes = Object.values(THEMES).sort((a, b) => {
    // Active theme first
    if (a.id === currentTheme.id) return -1;
    if (b.id === currentTheme.id) return 1;
    
    // Default theme second
    if (a.id === 'default') return -1;
    if (b.id === 'default') return 1;
    
    // Then owned themes
    const aOwned = ownedThemes.includes(a.id);
    const bOwned = ownedThemes.includes(b.id);
    if (aOwned && !bOwned) return -1;
    if (!aOwned && bOwned) return 1;
    
    // Then by cost
    return a.cost - b.cost;
  });

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 border-b pb-4" style={{ borderColor: currentTheme.borderColor }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: currentTheme.primaryColor }}>
              $ theme_marketplace.sh
            </h1>
            <p className="text-sm opacity-80" style={{ color: currentTheme.textColor }}>
              Purchase and switch between themes using your earned XP
            </p>
          </div>
          
          <div 
            className="px-4 py-2 font-mono text-sm border"
            style={{ borderColor: currentTheme.borderColor }}
          >
            <span className="opacity-70">$ cat balance.xp | </span>
            <span className="font-bold">
              {loadingXP ? 'loading...' : `${userXP} XP`}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedThemes.map(theme => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isOwned={ownedThemes.includes(theme.id) || theme.id === 'default'}
            isActive={currentTheme.id === theme.id}
            onPurchase={handlePurchase}
            onSwitch={handleSwitch}
            userXP={userXP}
          />
        ))}
      </div>
      
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <ConfirmationDialog
            isOpen={confirmDialog.isOpen}
            onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            confirmText={confirmDialog.confirmText}
            theme={THEMES[confirmDialog.themeId] || currentTheme}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeMarketplace;