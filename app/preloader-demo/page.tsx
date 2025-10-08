'use client';

import React, { useState, useEffect } from 'react';
import Preloader from '@/components/ui/preloader';
import { Button } from '@/components/ui/button';

const PreloaderDemo = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    // Auto-hide preloader after 3 seconds on initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowDemo(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const showPreloader = () => {
    setIsLoading(true);
    setShowDemo(false);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setIsLoading(false);
      setShowDemo(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Preloader isLoading={isLoading} />
      
      {showDemo && (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Happy Feet Preloader Demo
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              This is a demonstration of the Happy Feet preloader animation. 
              The preloader features the brand logo with smooth animations 
              including walking feet and loading indicators.
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={showPreloader}
                className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg"
              >
                Show Preloader Again
              </Button>
              
              <div className="text-sm text-gray-500">
                The preloader will automatically hide after 3 seconds
              </div>
            </div>
            
            <div className="mt-12 p-6 bg-white rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Features:</h2>
              <ul className="text-left space-y-2 text-gray-600">
                <li>• Animated Happy Feet logo with pulse effect</li>
                <li>• Walking feet animation with alternating steps</li>
                <li>• Smooth fade-in text animation</li>
                <li>• Bouncing loading dots</li>
                <li>• Full-screen overlay with clean design</li>
                <li>• Responsive and mobile-friendly</li>
              </ul>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Usage:</h3>
              <p className="text-blue-800 text-sm">
                Import the Preloader component and use the `isLoading` prop to control visibility. 
                Perfect for initial page loads, route transitions, or any loading states.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreloaderDemo;