import { useCallback, useEffect, useState } from "react";
import { AnalysisRecord, PrivacyStorage } from "../lib/privacy";

interface SavedAnalysis {
  shareId: string;
  name: string;
  createdAt: string;
}

interface UsePrivacyStorageReturn {
  // Core privacy storage
  userCode: string;

  // Analysis management
  saveAnalysis: (
    deckList: string,
    analysisResult: any,
    options?: {
      name?: string;
    },
  ) => Promise<{ shareId: string; success: boolean }>;

  getAnalysis: (shareId: string) => Promise<{
    analysisResult: any;
    deckList: string | null;
    name: string | null;
    createdAt: string;
  } | null>;

  getUserAnalyses: () => Promise<SavedAnalysis[]>;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Utility functions
  shareAnalysisLink: (shareId: string) => Promise<void>;
  resetAllData: () => void;
  exportUserData: () => Promise<string>;
  importUserData: (jsonData: string) => Promise<boolean>;
}

export const usePrivacyStorage = (): UsePrivacyStorageReturn => {
  const [userCode, setUserCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize user code
  useEffect(() => {
    const code = PrivacyStorage.getUserCode();
    setUserCode(code);
  }, []);

  const saveAnalysis = useCallback(
    async (
      deckList: string,
      analysisResult: any,
      options: {
        name?: string;
      } = {},
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const id = PrivacyStorage.saveAnalysis({
          deckName: options.name || "Unnamed Deck",
          deckList,
          analysis: analysisResult,
        });
        return { shareId: id, success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error saving analysis";
        setError(errorMessage);
        return { shareId: "", success: false };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getAnalysis = useCallback(async (shareId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const analyses = PrivacyStorage.getMyAnalyses();
      const analysis = analyses.find(
        (a: AnalysisRecord) => a.id === shareId || a.shareId === shareId,
      );
      if (!analysis) return null;

      return {
        analysisResult: analysis.analysis,
        deckList: analysis.deckList,
        name: analysis.deckName,
        createdAt: analysis.date || new Date(analysis.timestamp).toISOString(),
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error loading analysis";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserAnalyses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const analyses = PrivacyStorage.getMyAnalyses();
      return analyses.map((a: AnalysisRecord) => ({
        shareId: a.id,
        name: a.deckName,
        createdAt: a.date || new Date(a.timestamp).toISOString(),
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error loading analyses";
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const shareAnalysisLink = useCallback(async (shareId: string) => {
    const url = `${window.location.origin}/analysis/${shareId}`;

    try {
      await navigator.clipboard.writeText(url);
      console.log("Link copied to clipboard");
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      console.log("Link copied (fallback)");
    }
  }, []);

  const resetAllData = useCallback(() => {
    PrivacyStorage.clearAllLocalData();
    setUserCode(PrivacyStorage.getUserCode());
    setError(null);
  }, []);

  const exportUserData = useCallback(async () => {
    try {
      return PrivacyStorage.exportAnalyses();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error exporting data";
      setError(errorMessage);
      return "[]";
    }
  }, []);

  const importUserData = useCallback(async (jsonData: string) => {
    try {
      PrivacyStorage.importAnalyses(jsonData);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error importing data";
      setError(errorMessage);
      return false;
    }
  }, []);

  return {
    userCode,
    saveAnalysis,
    getAnalysis,
    getUserAnalyses,
    isLoading,
    error,
    shareAnalysisLink,
    resetAllData,
    exportUserData,
    importUserData,
  };
};
