import { useCallback, useEffect, useState } from "react";
import type { AnalysisResult } from "../services/deckAnalyzer";

// Stored analysis result - serializable subset of AnalysisResult
type StoredAnalysisResult = Omit<AnalysisResult, 'cards' | 'landMetadata'> & {
  // Cards stored without functions (etbTapped removed during serialization)
  cards?: Array<{
    name: string;
    quantity: number;
    manaCost: string;
    colors: string[];
    isLand: boolean;
    producedMana?: string[];
    cmc: number;
  }>;
};

interface SavedAnalysis {
  id: string;
  name: string | null;
  deck_list: string;
  analysis_result: StoredAnalysisResult;
  created_at: string;
  format: string | null;
}

interface UseAnalysisStorageReturn {
  // State
  savedAnalyses: SavedAnalysis[];
  isLoading: boolean;
  error: string | null;

  // Actions
  saveAnalysis: (
    deckList: string,
    analysisResult: StoredAnalysisResult,
    name?: string,
    format?: string,
  ) => Promise<SavedAnalysis | null>;
  loadAnalyses: () => Promise<void>;
  deleteAnalysis: (id: string) => Promise<void>;
  clearError: () => void;

  // Local storage
  saveToLocal: (deckList: string, analysisResult: StoredAnalysisResult, name?: string) => void;
  loadFromLocal: () => SavedAnalysis[];
}

const LOCAL_STORAGE_KEY = "manatuner-analyses";

export const useAnalysisStorage = (): UseAnalysisStorageReturn => {
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Local storage helpers
  const saveToLocal = useCallback(
    (deckList: string, analysisResult: StoredAnalysisResult, name?: string) => {
      try {
        const existing = loadFromLocalInternal();
        const newAnalysis: SavedAnalysis = {
          id: Date.now().toString(),
          name: name || null,
          deck_list: deckList,
          analysis_result: analysisResult,
          created_at: new Date().toISOString(),
          format: null,
        };

        const updated = [newAnalysis, ...existing].slice(0, 50);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        setSavedAnalyses(updated);
      } catch (err) {
        console.error("Failed to save to local storage:", err);
        setError("Failed to save data");
      }
    },
    [],
  );

  // Internal load function
  const loadFromLocalInternal = (): SavedAnalysis[] => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      // Handle legacy wrapper format
      if (parsed.data && !parsed.encrypted) {
        return JSON.parse(parsed.data);
      }
      // If encrypted, clear it
      if (parsed.encrypted) {
        console.warn('Clearing legacy encrypted storage');
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return [];
      }
      return [];
    } catch {
      return [];
    }
  };

  const loadFromLocal = useCallback((): SavedAnalysis[] => {
    return loadFromLocalInternal();
  }, []);

  // Save analysis
  const saveAnalysis = useCallback(
    async (
      deckList: string,
      analysisResult: StoredAnalysisResult,
      name?: string,
      format?: string,
    ): Promise<SavedAnalysis | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Save to local storage
        const existing = loadFromLocalInternal();
        const newAnalysis: SavedAnalysis = {
          id: Date.now().toString(),
          name: name || null,
          deck_list: deckList,
          analysis_result: analysisResult,
          created_at: new Date().toISOString(),
          format: format || null,
        };

        const updated = [newAnalysis, ...existing].slice(0, 50);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        setSavedAnalyses(updated);
        return newAnalysis;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error saving";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const loadAnalyses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const localAnalyses = loadFromLocalInternal();
      setSavedAnalyses(localAnalyses);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error loading";
      setError(errorMessage);
      setSavedAnalyses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAnalysis = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const localAnalyses = loadFromLocalInternal();
      const filtered = localAnalyses.filter((analysis) => analysis.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      setSavedAnalyses(filtered);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error deleting";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load analyses on mount
  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

  return {
    // State
    savedAnalyses,
    isLoading,
    error,

    // Actions
    saveAnalysis,
    loadAnalyses,
    deleteAnalysis,
    clearError,

    // Local storage
    saveToLocal,
    loadFromLocal,
  };
};

export default useAnalysisStorage;
