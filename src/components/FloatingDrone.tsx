import { useEffect, useState } from 'react';

const FloatingDrone = () => {
  const [position, setPosition] = useState({ x: 20, y: 20 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => ({
        x: Math.max(10, Math.min(90, prev.x + (Math.random() - 0.5) * 10)),
        y: Math.max(10, Math.min(90, prev.y + (Math.random() - 0.5) * 10))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="fixed pointer-events-none z-50 transition-all duration-3000 ease-in-out"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="relative animate-float">
        <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse flex items-center justify-center backdrop-blur-sm border border-primary/30">
          <div className="animate-bounce">
            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6L13 7H11L9 6L3 7V9L9 10L11 11H13L15 10L21 9ZM12 13C10.9 13 10 13.9 10 15C10 16.1 10.9 17 12 17C13.1 17 14 16.1 14 15C14 13.9 13.1 13 12 13ZM12 19C10.9 19 10 19.9 10 21C10 22.1 10.9 23 12 23C13.1 23 14 22.1 14 21C14 19.9 13.1 19 12 19Z"/>
            </svg>
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        
        {/* Pulse rings */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-ring"></div>
        <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
};

export default FloatingDrone;
