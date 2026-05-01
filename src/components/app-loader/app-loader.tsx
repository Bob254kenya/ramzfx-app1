import React, { useState, useEffect, useRef } from 'react';
import './app-loader.scss';

interface AppLoaderProps {
    onLoadingComplete: () => void;
    duration?: number; // duration in ms (default 6000)
}

const AppLoader: React.FC<AppLoaderProps> = ({ onLoadingComplete, duration = 6000 }) => {
  const [progress, setProgress] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const bgElementsRef = useRef<HTMLDivElement>(null);
  const [colorThemeIndex, setColorThemeIndex] = useState(0);
  
  // Dynamic color themes for loader container (rotating accent)
  const colorThemes = [
    { primary: '#f5b042', secondary: '#00e0ff', glow: 'goldenrod' },
    { primary: '#10b981', secondary: '#34d399', glow: '#2dd4bf' },
    { primary: '#c084fc', secondary: '#e879f9', glow: '#d946ef' },
    { primary: '#f43f5e', secondary: '#fb7185', glow: '#ff7b89' },
    { primary: '#3b82f6', secondary: '#60a5fa', glow: '#38bdf8' },
  ];

  // Cycle loader container border & accent every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setColorThemeIndex((prev) => (prev + 1) % colorThemes.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Apply dynamic styling to container via CSS variables
  useEffect(() => {
    const container = document.querySelector('.loader-container') as HTMLElement;
    if (container) {
      const theme = colorThemes[colorThemeIndex];
      container.style.setProperty('--dynamic-primary', theme.primary);
      container.style.setProperty('--dynamic-secondary', theme.secondary);
      container.style.setProperty('--dynamic-glow', theme.glow);
      container.style.borderLeft = `2px solid ${theme.primary}`;
      container.style.boxShadow = `0 0 18px ${theme.primary}40, inset 0 0 0 1px ${theme.secondary}30`;
    }
  }, [colorThemeIndex]);

  // Create rich stars with glowing variation
  const createStars = () => {
    if (!bgElementsRef.current) return;
    for (let i = 0; i < 280; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = Math.random() * 5 + 0.8;
      const leftPos = Math.random() * 100;
      const topPos = Math.random() * 100;
      const duration = 1.5 + Math.random() * 6;
      const delay = Math.random() * 8;
      const opacity = 0.3 + Math.random() * 0.9;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${leftPos}%`;
      star.style.top = `${topPos}%`;
      star.style.setProperty('--duration', `${duration}s`);
      star.style.setProperty('--opacity', opacity.toString());
      star.style.animationDelay = `${delay}s`;
      if (Math.random() > 0.85) {
        star.style.background = 'radial-gradient(circle, gold, #ffaa33)';
        star.style.boxShadow = '0 0 5px gold';
      } else if (Math.random() > 0.9) {
        star.style.background = 'radial-gradient(circle, cyan, #00aaff)';
      }
      bgElementsRef.current.appendChild(star);
    }
  };

  // Create falling premium assets (dollar, crypto, gems)
  const createPremiumAsset = () => {
    if (!bgElementsRef.current) return;
    const assets = ['💰', '💵', '💲', '🪙', '💎', '📈', '⚡', '🔥', '💹', '🚀', '💸'];
    const randomAsset = assets[Math.floor(Math.random() * assets.length)];
    const dollar = document.createElement('div');
    dollar.className = 'dollar';
    dollar.textContent = randomAsset;
    
    const leftPos = Math.random() * 100;
    const duration = 2.5 + Math.random() * 8;
    const delay = Math.random() * 1.5;
    const size = 0.8 + Math.random() * 1.8;
    const rotation = Math.random() * 360;
    const drift = (Math.random() - 0.5) * 35;
    
    // apply color variation based on random hue
    const hue = Math.random() * 360;
    dollar.style.color = `hsl(${hue}, 85%, 65%)`;
    dollar.style.left = `${leftPos}%`;
    dollar.style.animationDuration = `${duration}s`;
    dollar.style.animationDelay = `${delay}s`;
    dollar.style.fontSize = `${size}rem`;
    dollar.style.opacity = (0.5 + Math.random() * 0.6).toString();
    dollar.style.transform = `rotate(${rotation}deg)`;
    dollar.style.setProperty('--drift', `${drift}px`);
    dollar.style.filter = `drop-shadow(0 0 5px hsl(${hue}, 80%, 60%))`;
    
    bgElementsRef.current.appendChild(dollar);
    
    setTimeout(() => {
      if (dollar.parentNode === bgElementsRef.current) {
        bgElementsRef.current?.removeChild(dollar);
      }
    }, duration * 1000);
  };

  // Create burst of premium assets (rain effect heavy)
  const createAssetBurst = () => {
    const burstCount = 6 + Math.floor(Math.random() * 6);
    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => createPremiumAsset(), i * 45);
    }
  };

  // Also create floating glossy orbs for extra depth
  const createGlowOrbs = () => {
    if (!bgElementsRef.current) return;
    for (let i = 0; i < 30; i++) {
      const orb = document.createElement('div');
      orb.className = 'orb';
      const size = 60 + Math.random() * 180;
      orb.style.width = `${size}px`;
      orb.style.height = `${size}px`;
      orb.style.left = `${Math.random() * 100}%`;
      orb.style.top = `${Math.random() * 100}%`;
      orb.style.animationDuration = `${10 + Math.random() * 20}s`;
      orb.style.animationDelay = `${Math.random() * 10}s`;
      orb.style.background = `radial-gradient(circle, rgba(${100 + Math.random() * 155}, ${50 + Math.random() * 100}, ${150 + Math.random() * 105}, 0.2), rgba(0,0,0,0))`;
      bgElementsRef.current.appendChild(orb);
    }
  };

  // interactive 3D mouse movement effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateX = y * 8;
    const rotateY = x * 8;
    container.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    container.style.transition = 'transform 0.1s ease-out';
  };
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    e.currentTarget.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
  };

  // Initialize all premium animated effects
  useEffect(() => {
    createStars();
    createGlowOrbs();
    
    // initial heavy rain of premium icons
    for (let i = 0; i < 120; i++) {
      setTimeout(() => createPremiumAsset(), i * 25);
    }
    
    // continuous bursts
    const burstInterval = setInterval(createAssetBurst, 180);
    const singleInterval = setInterval(createPremiumAsset, 70);
    
    // Simulated loading progress with dynamic acceleration (6 sec default)
    let currentProgress = 1;
    let speed = 0.55;
    const stepTime = duration / 100; // smooth over ~100 steps
    
    const progressInterval = setInterval(() => {
      if (currentProgress < 35) {
        speed += 0.2;
      } else if (currentProgress > 88) {
        speed *= 0.86;
      }
      currentProgress = Math.min(currentProgress + speed, 100);
      setProgress(Math.floor(currentProgress));
      
      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onLoadingComplete();
          }, 350);
        }, 200);
      }
    }, stepTime);
    
    return () => {
      clearInterval(burstInterval);
      clearInterval(singleInterval);
      clearInterval(progressInterval);
    };
  }, [onLoadingComplete, duration]);

  if (!isVisible) return null;

  // Apply current dynamic theme colors inline to container for extra flair
  const activeTheme = colorThemes[colorThemeIndex];
  
  return (
    <div className="trading-hub-loader">
      <div className="background-elements" ref={bgElementsRef}></div>
      <div 
        className="loader-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          borderTop: `1px solid ${activeTheme.primary}80`,
          borderRight: `1px solid ${activeTheme.secondary}60`,
        }}
      >
        <div className="logo">
          <div className="logo-main">RAMZFX</div>
          <div className="logo-sub">TRADINGHUB</div>
        </div>
        
        <div className="welcome-message">
          <div className="welcome-title">⚡ deriv third party premium ecosystem ⚡</div>
          <div className="welcome-text">Gain access to elite trading features & AI-enhanced automation</div>
        </div>
        
        <div className="features-container">
          <div className="feature-main">✨ Automate your trades now ✨</div>
          <ul className="feature-list">
            <li className="feature-item">📊 Analysis Tool</li>
            <li className="feature-item">🤖 Trading Bots</li>
            <li className="feature-item">🔄 Copy Trading</li>
            <li className="feature-item">📈 AI Signals</li>
          </ul>
          <div className="feature-tagline">Making trading smooth, simple, and stress-free</div>
        </div>
        
        <div className="progress-container">
          <div className="progress-text">
            <span>Loading premium infrastructure</span>
            <span className="progress-percent">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${activeTheme.primary}, ${activeTheme.secondary}, #facc15)`,
                backgroundSize: '200% 100%'
              }}
            ></div>
          </div>
          <div className="progress-dots">
            <div className="progress-dot"></div>
            <div className="progress-dot"></div>
            <div className="progress-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLoader;