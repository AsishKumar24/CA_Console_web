import { useState, useEffect, ReactNode } from 'react';
import { LoadingScreen } from '../ui/LoadingScreen';

interface AppInitializerProps {
  children: ReactNode;
  minimumLoadingTime?: number;
}

/**
 * AppInitializer - Shows a loading screen on initial app mount
 * This ensures users see the shader animation when the app first loads
 */
export function AppInitializer({ 
  children, 
  minimumLoadingTime = 2000 // 2 seconds for initial app load
}: AppInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, minimumLoadingTime);

    return () => clearTimeout(timer);
  }, [minimumLoadingTime]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
