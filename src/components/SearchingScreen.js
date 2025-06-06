import React, { useState, useEffect } from 'react';
import './SearchingScreen.css';

const SearchingScreen = ({ userName = 'franco' }) => {
  const [currentProvider, setCurrentProvider] = useState(0);
  const [progress, setProgress] = useState(0);

  const providers = [
    { name: 'FARMERS', logo: '🏛️' },
    { name: 'STATE FARM', logo: '🚗' },
    { name: 'GEICO', logo: '🦎' },
    { name: 'PROGRESSIVE', logo: '💙' },
    { name: 'ALLSTATE', logo: '🤝' }
  ];

  useEffect(() => {
    // Rotate through providers
    const providerInterval = setInterval(() => {
      setCurrentProvider(prev => (prev + 1) % providers.length);
    }, 800);

    // Update progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 100);

    return () => {
      clearInterval(providerInterval);
      clearInterval(progressInterval);
    };
  }, [providers.length]);

  return (
    <div className="searching-screen">
      <div className="searching-content">
        <h1 className="searching-title">
          <span className="user-name">{userName}</span>, we're searching for your best rates so that you can compare and choose the best fit
        </h1>
        
        <div className="provider-card">
          <div className="provider-logo">
            {providers[currentProvider].logo}
          </div>
          <div className="provider-name">
            {providers[currentProvider].name}
          </div>
          <div className="insurance-text">INSURANCE</div>
        </div>

        <div className="progress-container">
          <div className="progress-text">Matches ready in {Math.ceil((100 - progress) / 20)}</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchingScreen; 