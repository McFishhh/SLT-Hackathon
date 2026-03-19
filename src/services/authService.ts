import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import { UserLoginInput, UserProfile, UserRegistrationInput } from "@/types";

function formatAuthError(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return "Something went wrong. Please try again.";
  }

  switch (error.code) {
    case "permission-denied":
      return "Firestore permissions blocked this request. Update your Firestore rules to allow signed-in users to read and write their own profile.";
    case "auth/email-already-in-use":
      return "That email is already registered. Try logging in instead.";
    case "auth/invalid-credential":
      return "The email or password is incorrect.";
    case "auth/weak-password":
      return "Password must be at least 6 characters long.";
    default:
      return error.message;
  }
}

export const authService = {
  async getUserProfileById(userId: string): Promise<UserProfile | null> {
    const userSnapshot = await getDoc(doc(firebaseDb, "users", userId));

    if (!userSnapshot.exists()) {
      return null;
    }

    const userProfile = userSnapshot.data() as UserProfile;

    return {
      id: userId,
      displayName: userProfile.displayName,
      email: userProfile.email,
      role: userProfile.role,
      interests: userProfile.interests ?? [],
      signedUpEventIds: userProfile.signedUpEventIds ?? []
    };
  },

  async registerUser(input: UserRegistrationInput): Promise<UserProfile> {
    try {
      const credentials = await createUserWithEmailAndPassword(firebaseAuth, input.email.trim(), input.password);

      await updateProfile(credentials.user, {
        displayName: input.displayName
      });

      const userProfile: UserProfile = {
        id: credentials.user.uid,
        displayName: input.displayName,
        email: input.email.trim(),
        role: input.role,
        interests: input.interests,
        signedUpEventIds: []
      };

      try {
        await setDoc(doc(firebaseDb, "users", credentials.user.uid), {
          ...userProfile,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        await deleteUser(credentials.user).catch(() => undefined);
        throw error;
      }

      return userProfile;
    } catch (error) {
      throw new Error(formatAuthError(error));
    }
  },

  async loginUser(input: UserLoginInput): Promise<UserProfile> {
    try {
      const credentials = await signInWithEmailAndPassword(firebaseAuth, input.email.trim(), input.password);
      const userProfile = await this.getUserProfileById(credentials.user.uid);

      if (!userProfile) {
        throw new Error("No user profile was found for this account.");
      }

      if (userProfile.role !== input.role) {
        throw new Error(`This account is registered as ${userProfile.role}, not ${input.role}.`);
      }

      return userProfile;
    } catch (error) {
      if (error instanceof Error && !(error instanceof FirebaseError)) {
        throw error;
      }

      throw new Error(formatAuthError(error));
    }
  }
};
