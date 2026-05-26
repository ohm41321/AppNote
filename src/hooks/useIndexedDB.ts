import { useState, useEffect } from 'react';
import { getDbValue, setDbValue } from '@/utils/db';

export function useIndexedDB<T>(
  key: string,
  initialValue: T,
  legacyLocalStorageKey?: string
): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from IndexedDB (or migrate from localStorage) on mount
  useEffect(() => {
    async function loadData() {
      try {
        const dbValue = await getDbValue<T>(key);
        if (dbValue !== null) {
          setStoredValue(dbValue);
        } else if (legacyLocalStorageKey && typeof window !== 'undefined') {
          // Attempt migration from localStorage
          const legacyValue = window.localStorage.getItem(legacyLocalStorageKey);
          if (legacyValue !== null) {
            try {
              const parsed = JSON.parse(legacyValue) as T;
              setStoredValue(parsed);
              // Save to IndexedDB
              await setDbValue(key, parsed);
              // Clean up localStorage to avoid duplicate storage
              window.localStorage.removeItem(legacyLocalStorageKey);
              console.log(`Migrated key "${legacyLocalStorageKey}" to IndexedDB key "${key}"`);
            } catch (err) {
              console.warn(`Failed parsing legacy localStorage key "${legacyLocalStorageKey}":`, err);
            }
          }
        }
      } catch (error) {
        console.warn(`Error loading IndexedDB key "${key}":`, error);
      } finally {
        setIsLoaded(true);
      }
    }

    loadData();
  }, [key, legacyLocalStorageKey]);

  // Wrapped setter to update React state & persist in IndexedDB asynchronously
  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be an updater function so we match useState signature
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Update state immediately
      setStoredValue(valueToStore);

      // Async persist to database
      await setDbValue(key, valueToStore);
    } catch (error) {
      console.warn(`Error setting IndexedDB key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isLoaded];
}
