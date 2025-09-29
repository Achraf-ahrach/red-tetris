import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from '@/pages/landing';
import Game from '@/pages/game';

const HashHandler = () => {
  const navigate = useNavigate();
  const [hashData, setHashData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Function to parse URL hash format: #roomName[playerName]
    const parseUrlHash = () => {
      const hash = window.location.hash.substring(1); // Remove the # symbol
      
      // Check if there's a hash
      if (!hash) {
        return null;
      }
      
      const match = hash.match(/^(.+)\[(.+)\]$/);
      
      if (match) {
        return {
          room: match[1],
          player: match[2]
        };
      }
      return null;
    };

    const urlHashData = parseUrlHash();
    setHashData(urlHashData);
    setIsLoading(false);

    // Listen for hash changes
    const handleHashChange = () => {
      const newHashData = parseUrlHash();
      setHashData(newHashData);
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Show loading while parsing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl text-center border border-white/20 shadow-2xl">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  // If there's a valid hash, render the Game component with the hash data
  if (hashData) {
    return <Game roomName={hashData.room} playerName={hashData.player} />;
  }

  // If no hash, render the landing page
  return <LandingPage />;
};

export default HashHandler;