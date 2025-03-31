import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './context/ThemeContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const SideQuests = ({ handle }) => {
  const { currentTheme } = useTheme();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuest, setNewQuest] = useState({ title: '', description: '', xpReward: 50 });
  const [userXP, setUserXP] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  // Fetch quests and user data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch quests
        const questsResponse = await axios.get(`http://localhost:5000/api/users/${handle}/quests`);
        setQuests(questsResponse.data || []);
        
        // Fetch user data to get current XP
        const userResponse = await axios.get(`http://localhost:5000/api/users/${handle}`);
        setUserXP(userResponse.data.experience);
      } catch (error) {
        console.error("Error fetching quests:", error);
        toast.error('Failed to load quests data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [handle]);

  // Add a new quest
  const handleAddQuest = async () => {
    if (!newQuest.title) {
      toast.error('Quest title cannot be empty');
      return;
    }
    
    try {
      const response = await axios.post(`http://localhost:5000/api/users/${handle}/quests`, {
        title: newQuest.title,
        description: newQuest.description,
        xpReward: parseInt(newQuest.xpReward) || 50
      });
      
      setQuests([...quests, response.data]);
      setNewQuest({ title: '', description: '', xpReward: 50 });
      setIsAdding(false);
      toast.success('New quest added successfully');
    } catch (error) {
      console.error("Error adding quest:", error);
      toast.error('Failed to add new quest');
    }
  };

  // Complete a quest
  const handleCompleteQuest = async (questId) => {
    try {
      // Mark quest as completed
      await axios.put(`http://localhost:5000/api/users/${handle}/quests/${questId}/complete`);
      
      // Find the quest to get the XP reward
      const completedQuest = quests.find(q => q._id === questId);
      
      if (completedQuest) {
        // Update user's XP
        await axios.put(`http://localhost:5000/api/users/${handle}/update`, {
          experience: completedQuest.xpReward
        });
        
        // Update local state
        setUserXP(prev => prev + completedQuest.xpReward);
        setQuests(quests.map(q => 
          q._id === questId ? { ...q, completed: true, completedAt: new Date() } : q
        ));
        
        toast.success(`Quest completed! +${completedQuest.xpReward} XP`);
      }
    } catch (error) {
      console.error("Error completing quest:", error);
      toast.error('Failed to complete quest');
    }
  };

  // Delete a quest
  const handleDeleteQuest = async (questId) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${handle}/quests/${questId}`);
      setQuests(quests.filter(q => q._id !== questId));
      toast.success('Quest deleted successfully');
    } catch (error) {
      console.error("Error deleting quest:", error);
      toast.error('Failed to delete quest');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Group quests into completed and active
  const activeQuests = quests.filter(quest => !quest.completed);
  const completedQuests = quests.filter(quest => quest.completed);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: currentTheme.primaryColor }}>
            Side Quests
          </h1>
          <p className="text-sm opacity-80" style={{ color: currentTheme.textColor }}>
            Complete quests to earn XP and track your progress
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <div 
            className="px-4 py-2 font-mono text-sm border"
            style={{ borderColor: currentTheme.borderColor, color: currentTheme.textColor }}
          >
            <span className="opacity-70">Current XP: </span>
            <span className="font-bold" style={{ color: currentTheme.primaryColor }}>
              {userXP} XP
            </span>
          </div>
          
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 font-mono text-sm"
            style={{
              backgroundColor: currentTheme.highlightColor,
              color: currentTheme.primaryColor,
              borderRadius: currentTheme.borderRadius,
              border: `1px solid ${currentTheme.primaryColor}`
            }}
          >
            + New Quest
          </button>
        </div>
      </div>
      
      {/* Loading State */}
      {loading ? (
        <div 
          className="flex flex-col items-center justify-center py-16"
          style={{ 
            backgroundColor: currentTheme.cardBgColor,
            borderRadius: currentTheme.borderRadius,
            border: `1px solid ${currentTheme.borderColor}`
          }}
        >
          <div className="loading-spinner mb-4" style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            border: `3px solid ${currentTheme.borderColor}`,
            borderTopColor: currentTheme.primaryColor,
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: currentTheme.textColor }}>Loading your quests...</p>
        </div>
      ) : (
        <>
          {/* Add Quest Form */}
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div 
                  className="p-6"
                  style={{
                    backgroundColor: currentTheme.cardBgColor,
                    borderRadius: currentTheme.borderRadius,
                    border: `1px solid ${currentTheme.primaryColor}`
                  }}
                >
                  <h3 className="text-lg font-bold mb-4" style={{ color: currentTheme.primaryColor }}>
                    Add New Quest
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label 
                        className="block mb-1 text-sm font-medium" 
                        style={{ color: currentTheme.textColor }}
                      >
                        Quest Title
                      </label>
                      <input 
                        type="text"
                        value={newQuest.title}
                        onChange={(e) => setNewQuest({...newQuest, title: e.target.value})}
                        className="w-full px-3 py-2"
                        style={{
                          backgroundColor: currentTheme.backgroundColor,
                          color: currentTheme.textColor,
                          border: `1px solid ${currentTheme.borderColor}`,
                          borderRadius: currentTheme.borderRadius
                        }}
                        placeholder="e.g., Solve Striver SDE Sheet"
                      />
                    </div>
                    
                    <div>
                      <label 
                        className="block mb-1 text-sm font-medium" 
                        style={{ color: currentTheme.textColor }}
                      >
                        Description
                      </label>
                      <textarea 
                        value={newQuest.description}
                        onChange={(e) => setNewQuest({...newQuest, description: e.target.value})}
                        className="w-full px-3 py-2 min-h-[100px]"
                        style={{
                          backgroundColor: currentTheme.backgroundColor,
                          color: currentTheme.textColor,
                          border: `1px solid ${currentTheme.borderColor}`,
                          borderRadius: currentTheme.borderRadius
                        }}
                        placeholder="Describe the quest requirements or objectives"
                      />
                    </div>
                    
                    <div>
                      <label 
                        className="block mb-1 text-sm font-medium" 
                        style={{ color: currentTheme.textColor }}
                      >
                        XP Reward
                      </label>
                      <input 
                        type="number"
                        value={newQuest.xpReward}
                        onChange={(e) => setNewQuest({...newQuest, xpReward: e.target.value})}
                        className="w-full px-3 py-2"
                        style={{
                          backgroundColor: currentTheme.backgroundColor,
                          color: currentTheme.textColor,
                          border: `1px solid ${currentTheme.borderColor}`,
                          borderRadius: currentTheme.borderRadius
                        }}
                        min="10"
                        max="1000"
                      />
                    </div>
                    
                    <div className="flex gap-3 justify-end">
                      <button 
                        onClick={() => setIsAdding(false)}
                        className="px-4 py-2 text-sm"
                        style={{
                          backgroundColor: 'transparent',
                          color: currentTheme.textColor,
                          borderRadius: currentTheme.borderRadius,
                          border: `1px solid ${currentTheme.borderColor}`
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleAddQuest}
                        className="px-4 py-2 text-sm"
                        style={{
                          backgroundColor: currentTheme.primaryColor,
                          color: currentTheme.backgroundColor,
                          borderRadius: currentTheme.borderRadius
                        }}
                      >
                        Add Quest
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Active Quests Section */}
          <div className="mb-8">
            <h2 
              className="text-lg font-bold mb-4 pb-2 border-b" 
              style={{ color: currentTheme.textColor, borderColor: currentTheme.borderColor }}
            >
              Active Quests
            </h2>
            
            {activeQuests.length === 0 ? (
              <div 
                className="text-center py-10" 
                style={{ 
                  backgroundColor: currentTheme.cardBgColor,
                  borderRadius: currentTheme.borderRadius,
                  color: currentTheme.textColor,
                  opacity: 0.7
                }}
              >
                <p>No active quests. Create a new quest to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeQuests.map((quest) => (
                  <motion.div
                    key={quest._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="p-5"
                    style={{
                      backgroundColor: currentTheme.cardBgColor,
                      borderRadius: currentTheme.borderRadius,
                      border: `1px solid ${currentTheme.borderColor}`
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold" style={{ color: currentTheme.primaryColor }}>
                        {quest.title}
                      </h3>
                      <div 
                        className="px-2 py-1 text-xs rounded-full"
                        style={{ 
                          backgroundColor: currentTheme.highlightColor,
                          color: currentTheme.primaryColor,
                          fontWeight: 'bold'
                        }}
                      >
                        +{quest.xpReward} XP
                      </div>
                    </div>
                    
                    {quest.description && (
                      <p 
                        className="mb-4 text-sm" 
                        style={{ color: currentTheme.textColor }}
                      >
                        {quest.description}
                      </p>
                    )}
                    
                    <div className="text-xs mb-4" style={{ color: currentTheme.textColor, opacity: 0.7 }}>
                      Added on {formatDate(quest.createdAt)}
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => handleDeleteQuest(quest._id)}
                        className="px-3 py-1 text-xs"
                        style={{
                          backgroundColor: 'transparent',
                          color: currentTheme.textColor,
                          borderRadius: currentTheme.borderRadius,
                          border: `1px solid ${currentTheme.borderColor}`
                        }}
                      >
                        Delete
                      </button>
                      <button 
                        onClick={() => handleCompleteQuest(quest._id)}
                        className="px-3 py-1 text-xs"
                        style={{
                          backgroundColor: currentTheme.highlightColor,
                          color: currentTheme.primaryColor,
                          borderRadius: currentTheme.borderRadius,
                          border: `1px solid ${currentTheme.primaryColor}`
                        }}
                      >
                        Complete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          
          {/* Completed Quests Section */}
          {completedQuests.length > 0 && (
            <div>
              <h2 
                className="text-lg font-bold mb-4 pb-2 border-b" 
                style={{ color: currentTheme.textColor, borderColor: currentTheme.borderColor }}
              >
                Completed Quests
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedQuests.map((quest) => (
                  <motion.div
                    key={quest._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="p-5"
                    style={{
                      backgroundColor: currentTheme.cardBgColor,
                      borderRadius: currentTheme.borderRadius,
                      border: `1px solid ${currentTheme.borderColor}`,
                      opacity: 0.8
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 
                        className="font-bold line-through" 
                        style={{ color: currentTheme.primaryColor }}
                      >
                        {quest.title}
                      </h3>
                      <div 
                        className="px-2 py-1 text-xs rounded-full"
                        style={{ 
                          backgroundColor: currentTheme.accentColor + '30',
                          color: currentTheme.accentColor,
                          fontWeight: 'bold'
                        }}
                      >
                        +{quest.xpReward} XP
                      </div>
                    </div>
                    
                    {quest.description && (
                      <p 
                        className="mb-4 text-sm line-through" 
                        style={{ color: currentTheme.textColor }}
                      >
                        {quest.description}
                      </p>
                    )}
                    
                    <div className="text-xs" style={{ color: currentTheme.textColor, opacity: 0.7 }}>
                      <div>Added on {formatDate(quest.createdAt)}</div>
                      <div>Completed on {formatDate(quest.completedAt)}</div>
                    </div>
                    
                    <div className="mt-3 text-right">
                      <button 
                        onClick={() => handleDeleteQuest(quest._id)}
                        className="px-3 py-1 text-xs"
                        style={{
                          backgroundColor: 'transparent',
                          color: currentTheme.textColor,
                          borderRadius: currentTheme.borderRadius,
                          border: `1px solid ${currentTheme.borderColor}`
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SideQuests;