import React from 'react';

// Mobile detection utility
export const isMobileDevice = (): boolean => {
  // Check for mobile user agents
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // Restrict if viewport width is less than 1024px (treat <1024 as non-desktop)
  const isSmallViewport = window.innerWidth < 1024;
  
  // Check for touch capability
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check user agent
  const isMobileUserAgent = mobileRegex.test(navigator.userAgent);
  
  // Consider device restricted if viewport is small OR clearly a mobile/touch device
  return isSmallViewport || (isTouchDevice && isMobileUserAgent);
};

// Hook for responsive mobile detection
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = React.useState(() => isMobileDevice());

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  
  if (width < 768) {
    return 'mobile';
  } else if (width < 1024) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};
