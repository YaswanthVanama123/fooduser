import { useState, useEffect } from 'react';

const SEARCH_HISTORY_KEY = 'searchHistory';
const MAX_HISTORY_ITEMS = 10;

interface UseSearchHistoryReturn {
  history: string[];
  addToHistory: (term: string) => void;
  removeFromHistory: (term: string) => void;
  clearHistory: () => void;
}

export const useSearchHistory = (): UseSearchHistoryReturn => {
  const [history, setHistory] = useState<string[]>([]);

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  // Save search history to localStorage whenever it changes
  const saveHistory = (newHistory: string[]) => {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  // Add a search term to history
  const addToHistory = (term: string) => {
    if (!term || term.trim().length === 0) return;

    const trimmedTerm = term.trim().toLowerCase();

    // Remove the term if it already exists (to avoid duplicates)
    const filteredHistory = history.filter(
      (item) => item.toLowerCase() !== trimmedTerm
    );

    // Add the new term at the beginning
    const newHistory = [trimmedTerm, ...filteredHistory].slice(
      0,
      MAX_HISTORY_ITEMS
    );

    saveHistory(newHistory);
  };

  // Remove a specific term from history
  const removeFromHistory = (term: string) => {
    const newHistory = history.filter(
      (item) => item.toLowerCase() !== term.toLowerCase()
    );
    saveHistory(newHistory);
  };

  // Clear all search history
  const clearHistory = () => {
    saveHistory([]);
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
};

export default useSearchHistory;
