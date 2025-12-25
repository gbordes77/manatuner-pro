import { useCallback, useEffect, useState } from "react";
import {
    decryptObject,
    encryptObject
} from "../lib/encryption";
import { PrivacyStorage } from "../lib/privacy";
import { handleSupabaseError, supabaseHelpers } from "../services/supabase";

interface SavedAnalysis {
  id: string;
  name: string | null;
  deck_list: string;
  analysis_result: any;
  created_at: string;
  format: string | null;
  is_public: boolean;
}

interface EncryptedLocalStorage {
  version: number;
  encrypted: boolean;
  data: string;
}

interface UseAnalysisStorageReturn {
  // State
  savedAnalyses: SavedAnalysis[];
  isLoading: boolean;
  error: string | null;

  // Actions
  saveAnalysis: (
    deckList: string,
    analysisResult: any,
    name?: string,
    format?: string,
  ) => Promise<SavedAnalysis | null>;
  loadAnalyses: () => Promise<void>;
  deleteAnalysis: (id: string) => Promise<void>;
  shareAnalysis: (
    deckList: string,
    analysisResult: any,
    name?: string,
  ) => Promise<string | null>;
  loadSharedAnalysis: (id: string) => Promise<SavedAnalysis | null>;
  clearError: () => void;

  // Local storage fallback (now with encryption)
  saveToLocal: (deckList: string, analysisResult: any, name?: string) => Promise<void>;
  loadFromLocal: () => Promise<SavedAnalysis[]>;

  // Encryption status
  isEncryptionReady: boolean;
}

const LOCAL_STORAGE_KEY = "manatuner-analyses";
const STORAGE_VERSION = 2; // Version 2 = encrypted

export const useAnalysisStorage = (): UseAnalysisStorageReturn => {
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEncryptionReady, setIsEncryptionReady] = useState(false);

  // Initialize encryption
  useEffect(() => {
    const init = async () => {
      try {
        const isValid = await PrivacyStorage.verifyUserCode();
        setIsEncryptionReady(isValid);
      } catch {
        setIsEncryptionReady(true); // Assume ready if no data exists
      }
    };
    init();
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get user code for encryption
  const getUserCode = useCallback(() => {
    return PrivacyStorage.getUserCode();
  }, []);

  // Check if stored data is legacy (unencrypted)
  const isLegacyFormat = useCallback((stored: string): boolean => {
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed);
    } catch {
      return false;
    }
  }, []);

  // Migrate legacy data to encrypted format
  const migrateLegacyData = useCallback(async (legacyData: SavedAnalysis[]): Promise<void> => {
    const userCode = getUserCode();
    const encryptedData = await encryptObject(legacyData, userCode);

    const storageWrapper: EncryptedLocalStorage = {
      version: STORAGE_VERSION,
      encrypted: true,
      data: encryptedData,
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storageWrapper));
  }, [getUserCode]);

  // Local storage helpers with encryption
  const saveToLocal = useCallback(
    async (deckList: string, analysisResult: any, name?: string) => {
      try {
        const existing = await loadFromLocalInternal();
        const newAnalysis: SavedAnalysis = {
          id: Date.now().toString(),
          name: name || null,
          deck_list: deckList,
          analysis_result: analysisResult,
          created_at: new Date().toISOString(),
          format: null,
          is_public: false,
        };

        const updated = [newAnalysis, ...existing].slice(0, 50);

        // Encrypt before storing
        const userCode = getUserCode();
        const encryptedData = await encryptObject(updated, userCode);

        const storageWrapper: EncryptedLocalStorage = {
          version: STORAGE_VERSION,
          encrypted: true,
          data: encryptedData,
        };

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storageWrapper));
        setSavedAnalyses(updated);
      } catch (err) {
        console.error("Failed to save to local storage:", err);
        setError("Failed to encrypt and save data");
      }
    },
    [getUserCode],
  );

  // Internal load function
  const loadFromLocalInternal = useCallback(async (): Promise<SavedAnalysis[]> => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return [];

      // Check for legacy format
      if (isLegacyFormat(stored)) {
        const legacyData = JSON.parse(stored) as SavedAnalysis[];
        // Migrate to encrypted format
        await migrateLegacyData(legacyData);
        return legacyData;
      }

      // Parse the storage wrapper
      const wrapper = JSON.parse(stored) as EncryptedLocalStorage;

      if (!wrapper.encrypted) {
        // Unencrypted wrapper format
        return JSON.parse(wrapper.data) as SavedAnalysis[];
      }

      // Decrypt the data
      const userCode = getUserCode();
      const analyses = await decryptObject<SavedAnalysis[]>(wrapper.data, userCode);
      return analyses;
    } catch (err) {
      console.error("Failed to load from local storage:", err);
      return [];
    }
  }, [getUserCode, isLegacyFormat, migrateLegacyData]);

  const loadFromLocal = useCallback(async (): Promise<SavedAnalysis[]> => {
    return loadFromLocalInternal();
  }, [loadFromLocalInternal]);

  // Supabase operations
  const saveAnalysis = useCallback(
    async (
      deckList: string,
      analysisResult: any,
      name?: string,
      format?: string,
    ): Promise<SavedAnalysis | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Try Supabase first
        if (supabaseHelpers.isConfigured()) {
          const result = await supabaseHelpers.saveAnalysis();

          if (result.success && result.id) {
            const saved: SavedAnalysis = {
              id: result.id,
              name: name || null,
              deck_list: deckList,
              analysis_result: analysisResult,
              created_at: new Date().toISOString(),
              format: format || null,
              is_public: false,
            };
            // Update local state
            setSavedAnalyses((prev) => [saved, ...prev]);
            return saved;
          } else {
            // Fallback to local storage with encryption
            await saveToLocal(deckList, analysisResult, name);
            return null;
          }
        } else {
          // Fallback to local storage with encryption
          await saveToLocal(deckList, analysisResult, name);
          return null;
        }
      } catch (err) {
        const errorMessage = handleSupabaseError(err);
        setError(errorMessage);

        // Fallback to local storage with encryption on error
        await saveToLocal(deckList, analysisResult, name);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [saveToLocal],
  );

  const loadAnalyses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (supabaseHelpers.isConfigured()) {
        const analyses = await supabaseHelpers.getUserAnalyses();
        setSavedAnalyses(analyses);
      } else {
        // Load from encrypted local storage
        const localAnalyses = await loadFromLocal();
        setSavedAnalyses(localAnalyses);
      }
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);

      // Fallback to local storage
      try {
        const localAnalyses = await loadFromLocal();
        setSavedAnalyses(localAnalyses);
      } catch {
        setSavedAnalyses([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadFromLocal]);

  const deleteAnalysis = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        if (supabaseHelpers.isConfigured()) {
          // Delete from Supabase
          setSavedAnalyses((prev) =>
            prev.filter((analysis) => analysis.id !== id),
          );
        } else {
          // Remove from encrypted local storage
          const localAnalyses = await loadFromLocal();
          const filtered = localAnalyses.filter(
            (analysis) => analysis.id !== id,
          );

          // Re-encrypt and save
          const userCode = getUserCode();
          const encryptedData = await encryptObject(filtered, userCode);

          const storageWrapper: EncryptedLocalStorage = {
            version: STORAGE_VERSION,
            encrypted: true,
            data: encryptedData,
          };

          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storageWrapper));
          setSavedAnalyses(filtered);
        }
      } catch (err) {
        const errorMessage = handleSupabaseError(err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [loadFromLocal, getUserCode],
  );

  const shareAnalysis = useCallback(
    async (
      deckList: string,
      analysisResult: any,
      name?: string,
    ): Promise<string | null> => {
      setIsLoading(true);
      setError(null);

      try {
        if (supabaseHelpers.isConfigured()) {
          const shared = await supabaseHelpers.createShareableAnalysis();
          if (shared.success && shared.shareId) {
            return shared.shareId;
          }
          setError("Failed to create shareable analysis");
          return null;
        } else {
          setError("Sharing requires an internet connection");
          return null;
        }
      } catch (err) {
        const errorMessage = handleSupabaseError(err);
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const loadSharedAnalysis = useCallback(
    async (id: string): Promise<SavedAnalysis | null> => {
      setIsLoading(true);
      setError(null);

      try {
        if (supabaseHelpers.isConfigured()) {
          const analysis = await supabaseHelpers.getSharedAnalysis();
          return analysis;
        } else {
          setError("Loading shared analysis requires an internet connection");
          return null;
        }
      } catch (err) {
        const errorMessage = handleSupabaseError(err);
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

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
    shareAnalysis,
    loadSharedAnalysis,
    clearError,

    // Local storage fallback
    saveToLocal,
    loadFromLocal,

    // Encryption status
    isEncryptionReady,
  };
};

export default useAnalysisStorage;
