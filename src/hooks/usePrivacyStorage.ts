import { useCallback, useEffect, useState } from "react";
import { PrivacyStorage } from "../lib/privacy";

interface SavedAnalysis {
  shareId: string;
  name: string;
  createdAt: string;
  isPrivate: boolean;
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
      isPrivate?: boolean;
      shareWithDeck?: boolean;
    },
  ) => Promise<{ shareId: string; success: boolean }>;

  getAnalysis: (shareId: string) => Promise<{
    analysisResult: any;
    deckList: string | null;
    name: string | null;
    createdAt: string;
    isPrivate: boolean;
  } | null>;

  getUserAnalyses: () => Promise<SavedAnalysis[]>;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Privacy controls
  isPrivateMode: boolean;
  setPrivateMode: (isPrivate: boolean) => void;

  // Utility functions
  shareAnalysisLink: (shareId: string) => Promise<void>;
  resetAllData: () => void;
  exportUserData: () => string;
  importUserData: (jsonData: string) => boolean;
}

export const usePrivacyStorage = (): UsePrivacyStorageReturn => {
  const [userCode, setUserCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPrivateMode, setIsPrivateModeState] = useState(true);

  // Initialize user code
  useEffect(() => {
    setUserCode(PrivacyStorage.getUserCode());
    setIsPrivateModeState(PrivacyStorage.getPrivacyMode());
  }, []);

  const saveAnalysis = useCallback(
    async (
      deckList: string,
      analysisResult: any,
      options: {
        name?: string;
        isPrivate?: boolean;
        shareWithDeck?: boolean;
      } = {},
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const id = PrivacyStorage.saveAnalysis({
          deckName: options.name || "Unnamed Deck",
          deckList,
          analysis: analysisResult,
          isPrivate: options.isPrivate ?? isPrivateMode,
        });
        return { shareId: id, success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur lors de la sauvegarde";
        setError(errorMessage);
        return { shareId: "", success: false };
      } finally {
        setIsLoading(false);
      }
    },
    [isPrivateMode],
  );

  const getAnalysis = useCallback(async (shareId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const analyses = PrivacyStorage.getMyAnalyses();
      const analysis = analyses.find(
        (a) => a.id === shareId || a.shareId === shareId,
      );
      if (!analysis) return null;

      return {
        analysisResult: analysis.analysis,
        deckList: analysis.deckList,
        name: analysis.deckName,
        createdAt: analysis.date || new Date(analysis.timestamp).toISOString(),
        isPrivate: analysis.isPrivate,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors du chargement";
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
      return analyses.map((a) => ({
        shareId: a.id,
        name: a.deckName,
        createdAt: a.date || new Date(a.timestamp).toISOString(),
        isPrivate: a.isPrivate,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des analyses";
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
      console.log("Lien copié dans le presse-papiers");
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      console.log("Lien copié (fallback)");
    }
  }, []);

  const resetAllData = useCallback(() => {
    PrivacyStorage.clearAllLocalData();
    setUserCode(PrivacyStorage.getUserCode());
  }, []);

  const exportUserData = useCallback(() => {
    return PrivacyStorage.exportAnalyses();
  }, []);

  const importUserData = useCallback((jsonData: string) => {
    try {
      PrivacyStorage.importAnalyses(jsonData);
      return true;
    } catch {
      return false;
    }
  }, []);

  const setPrivateMode = useCallback((isPrivate: boolean) => {
    setIsPrivateModeState(isPrivate);
    PrivacyStorage.setPrivacyMode(isPrivate);
  }, []);

  return {
    userCode,
    saveAnalysis,
    getAnalysis,
    getUserAnalyses,
    isLoading,
    error,
    isPrivateMode,
    setPrivateMode,
    shareAnalysisLink,
    resetAllData,
    exportUserData,
    importUserData,
  };
};
