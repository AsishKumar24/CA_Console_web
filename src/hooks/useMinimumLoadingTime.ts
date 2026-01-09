import { useState, useEffect } from 'react';

/**
 * Custom hook to ensure a minimum loading time for better UX
 * Useful when you want to show a loading animation for at least X milliseconds
 * 
 * @param isActuallyLoading - The actual loading state from your async operation
 * @param minimumMs - Minimum time in milliseconds to show loading (default: 1500ms)
 * @returns boolean - Whether to show loading indicator
 * 
 * @example
 * const [dataLoading, setDataLoading] = useState(false);
 * const showLoading = useMinimumLoadingTime(dataLoading, 2000);
 * 
 * if (showLoading) return <LoadingScreen />;
 */
export function useMinimumLoadingTime(
  isActuallyLoading: boolean,
  minimumMs: number = 1500
): boolean {
  const [showLoading, setShowLoading] = useState(isActuallyLoading);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    // When loading starts, record the start time
    if (isActuallyLoading && startTime === null) {
      setStartTime(Date.now());
      setShowLoading(true);
    }

    // When actual loading finishes
    if (!isActuallyLoading && startTime !== null) {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumMs - elapsedTime);

      // Wait for remaining time before hiding loading screen
      const timeoutId = setTimeout(() => {
        setShowLoading(false);
        setStartTime(null);
      }, remainingTime);

      return () => clearTimeout(timeoutId);
    }
  }, [isActuallyLoading, startTime, minimumMs]);

  return showLoading;
}
