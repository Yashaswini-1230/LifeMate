import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";

import { auth } from "./firebase";

// Create a new account
export async function signupUser(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password,
  );

  await updateProfile(credential.user, {
    displayName: name.trim(),
  });

  return credential.user;
}

// Login existing user
export async function loginUser(
  email: string,
  password: string,
): Promise<User> {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password,
  );

  return credential.user;
}

// Reset password
export async function resetPassword(
  email: string,
): Promise<void> {
  await sendPasswordResetEmail(
    auth,
    email.trim().toLowerCase(),
  );
}

// Logout
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
// Update the current user's profile name
export async function updateUserName(
  name: string,
): Promise<void> {
  const user = auth.currentUser;
  const trimmedName = name.trim();

  if (!user) {
    throw new Error(
      "Please sign in to update your profile."
    );
  }

  if (!trimmedName) {
    throw new Error("Please enter your name.");
  }

  if (trimmedName.length > 60) {
    throw new Error(
      "Name must not exceed 60 characters."
    );
  }

  await updateProfile(user, {
    displayName: trimmedName,
  });

  if (auth.currentUser?.uid !== user.uid) {
    throw new Error("Your account session has changed.");
  }
}
// Listen for authentication changes
export { onAuthStateChanged } from "firebase/auth";