import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2000,
  prefix = '',
  suffix = ''
}) => {
  const { theme } = useTheme();
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  React.useEffect(() => {
    setIsAnimating(true);
    const startTime = Date.now();
    const endValue = value;

    const updateCounter = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(endValue * easeOutQuart);

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value, duration]);

  return (
    <span className={`font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'
      } ${isAnimating ? 'transition-all duration-75' : ''}`}>
      {prefix}{displayValue.toLocaleString('en-US')}{suffix}
    </span>
  );
};

export default AnimatedCounter;