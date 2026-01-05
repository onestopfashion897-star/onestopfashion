'use client';

import React, { useState, useEffect } from 'react';
import Preloader from './preloader';

interface PreloaderWrapperProps {
  children: React.ReactNode;
  showPreloader?: boolean;
  minLoadingTime?: number; // Minimum time to show preloader (in ms)
}

/**
 * PreloaderWrapper component that can be used to wrap any content
 * and show a preloader while the content is loading.
 * 
 * Usage:
 * <PreloaderWrapper showPreloader={isLoading} minLoadingTime={1500}>
 *   <YourContent />
 * </PreloaderWrapper>
 */
const PreloaderWrapper: React.FC<PreloaderWrapperProps> = ({ 
  children, 
  showPreloader = false, 
  minLoadingTime = 300 
}) => {
  const [isLoading, setIsLoading] = useState(showPreloader);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!showPreloader) {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(true);
    }
  }, [showPreloader, startTime, minLoadingTime]);

  return (
    <>
      <Preloader isLoading={isLoading} />
      {!isLoading && children}
    </>
  );
};

export default PreloaderWrapper;