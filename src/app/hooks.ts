import React from "react";

/**
 * Custom hook for running given callback function in intervals
 *
 * @param callback callback function
 * @param delay delay as milliseconds
 * @returns function that clears interval when called
 */
export const useInterval = (callback: () => any, delay: number) => {
  const savedCallback = React.useRef<typeof callback>();
  const stopInterval = React.useRef<() => void>();

  React.useEffect(() => {
    savedCallback.current = callback;
  });

  React.useEffect(() => {
    const tick = () => savedCallback.current && savedCallback.current();
    const timeout = setInterval(tick, delay);

    stopInterval.current = () => clearInterval(timeout);

    return () => {
      clearInterval(timeout);
      stopInterval.current = undefined;
    };
  }, [delay]);

  return stopInterval.current;
};
