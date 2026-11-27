
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

import { auth } from "../lib/firebase";

import {
  getPreferences,
  savePreferences,
  type UserPreferences,
} from "../lib/preferencesStorage";

type PreferencesContextType = {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  refreshPreferences: () => Promise<void>;
  updatePreferences: (
    preferences: UserPreferences
  ) => Promise<void>;
};

const PreferencesContext =
  createContext<PreferencesContextType | undefined>(
    undefined
  );

type ProviderProps = {
  uid: string | null;
  children: ReactNode;
};

export function PreferencesProvider({
  uid,
  children,
}: ProviderProps) {
  const [preferences, setPreferences] =
    useState<UserPreferences | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null
  );

  const requestId = useRef(0);
  const saving = useRef(false);

  const refreshPreferences = useCallback(async () => {
    const currentRequest = ++requestId.current;

    setLoading(true);
    setError(null);

    try {
      if (!uid) {
        setPreferences(null);
        return;
      }

      const saved = await getPreferences(uid);

      if (
        currentRequest === requestId.current &&
        auth.currentUser?.uid === uid
      ) {
        setPreferences(saved);
      }
    } catch {
      if (currentRequest === requestId.current) {
        setPreferences(null);
        setError(
          "Unable to load your preferences. Please try again."
        );
      }
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }, [uid]);

  useEffect(() => {
    void refreshPreferences();

    return () => {
      requestId.current += 1;
    };
  }, [refreshPreferences]);

  const updatePreferences = async (
    updatedPreferences: UserPreferences
  ) => {
    if (!uid || auth.currentUser?.uid !== uid) {
      throw new Error("Invalid user session.");
    }

    if (saving.current) {
      throw new Error(
        "A preferences update is already in progress."
      );
    }

    saving.current = true;
    const currentRequest = ++requestId.current;



    try {
      await savePreferences(uid, updatedPreferences);

      if (auth.currentUser?.uid !== uid) {
        throw new Error("User session changed.");
      }

      if (currentRequest === requestId.current) {
        setPreferences(updatedPreferences);
      }
    } catch (error) {
      throw error;
    } finally {
      saving.current = false;

    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        loading,
        error,
        refreshPreferences,
        updatePreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error(
      "usePreferences must be used inside PreferencesProvider."
    );
  }

  return context;
}
