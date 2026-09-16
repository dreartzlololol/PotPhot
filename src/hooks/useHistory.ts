import { useState, useCallback, useRef } from 'react';

export function useHistory<T>(initialState: T, maxHistory: number = 50) {
  const [state, setState] = useState<T>(initialState);
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);
  const lastSaveTimeRef = useRef(Date.now());

  const set = useCallback((newState: T | ((prevState: T) => T)) => {
    setState((currentState) => {
      const resolvedState = typeof newState === 'function' ? (newState as Function)(currentState) : newState;
      
      // Don't save if state hasn't changed (simple reference check or deep compare could be used here)
      // Since it's a new object every time we spread, a simple reference check works if we are careful.
      // We will ensure to always create a new object in PotMiniGame.
      if (resolvedState === currentState) return currentState;

      const now = Date.now();
      if (now - lastSaveTimeRef.current > 300) {
        setPast((prevPast) => {
          const newPast = [...prevPast, currentState];
          if (newPast.length > maxHistory) {
            return newPast.slice(newPast.length - maxHistory);
          }
          return newPast;
        });
        setFuture([]); // Clear future on new action
      }
      
      lastSaveTimeRef.current = now;
      return resolvedState;
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;
      
      const previous = prevPast[prevPast.length - 1];
      const newPast = prevPast.slice(0, prevPast.length - 1);
      
      setState((currentState) => {
        setFuture((prevFuture) => [currentState, ...prevFuture]);
        return previous;
      });
      
      return newPast;
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      
      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);
      
      setState((currentState) => {
        setPast((prevPast) => [...prevPast, currentState]);
        return next;
      });
      
      return newFuture;
    });
  }, []);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return { state, set, undo, redo, canUndo, canRedo };
}
