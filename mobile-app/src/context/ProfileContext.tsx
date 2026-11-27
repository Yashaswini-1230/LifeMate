import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";

import {
  onIdTokenChanged,
  type User,
} from "firebase/auth";

import { auth } from "../lib/firebase";
import { updateUserName } from "../lib/auth";

type UserProfile = {
  uid: string;
  name: string;
  email: string;
  memberSince: string | null;
  emailVerified: boolean;
};

type ProfileContextType = {
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  updateName: (name: string) => Promise<void>;
};

const ProfileContext = createContext<
  ProfileContextType | undefined
>(undefined);

function getUserProfile(
  user: User | null
): UserProfile | null {
  if (!user) return null;

  return {
    uid: user.uid,
    name: user.displayName?.trim() || "",
    email: user.email || "",
    memberSince:
      user.metadata.creationTime ?? null,
    emailVerified: user.emailVerified,
  };
}

export function ProfileProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [profile, setProfile] =
    useState<UserProfile | null>(
      getUserProfile(auth.currentUser)
    );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const savingRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(
      auth,
      (user) => {
        setProfile(getUserProfile(user));
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const updateName = useCallback(
    async (name: string) => {
      if (savingRef.current) {
        throw new Error(
          "A profile update is already in progress."
        );
      }

      const uid = auth.currentUser?.uid;

      if (!uid) {
        throw new Error("Please sign in again.");
      }

      savingRef.current = true;
      setSaving(true);

      try {
        await updateUserName(name);

        if (auth.currentUser?.uid !== uid) {
          throw new Error(
            "Your account session has changed."
          );
        }

        setProfile(
          getUserProfile(auth.currentUser)
        );
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    },
    []
  );

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        saving,
        updateName,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error(
      "useProfile must be used inside ProfileProvider."
    );
  }

  return context;
}