import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { firebaseAuth, firebaseDb } from "@/lib/firebase";
import { UserLoginInput, UserProfile, UserRegistrationInput } from "@/types";

export const authService = {
  async registerUser(input: UserRegistrationInput): Promise<UserProfile> {
    const credentials = await createUserWithEmailAndPassword(firebaseAuth, input.email.trim(), input.password);

    await updateProfile(credentials.user, {
      displayName: input.displayName
    });

    const userProfile: UserProfile = {
      id: credentials.user.uid,
      displayName: input.displayName,
      email: input.email.trim(),
      role: input.role,
      interests: input.interests
    };

    await setDoc(doc(firebaseDb, "users", credentials.user.uid), {
      ...userProfile,
      createdAt: serverTimestamp()
    });

    return userProfile;
  },

  async loginUser(input: UserLoginInput): Promise<UserProfile> {
    const credentials = await signInWithEmailAndPassword(firebaseAuth, input.email.trim(), input.password);
    const userSnapshot = await getDoc(doc(firebaseDb, "users", credentials.user.uid));

    if (!userSnapshot.exists()) {
      throw new Error("No user profile was found for this account.");
    }

    const userProfile = userSnapshot.data() as UserProfile;

    if (userProfile.role !== input.role) {
      throw new Error(`This account is registered as ${userProfile.role}, not ${input.role}.`);
    }

    return {
      id: credentials.user.uid,
      displayName: userProfile.displayName,
      email: userProfile.email,
      role: userProfile.role,
      interests: userProfile.interests ?? []
    };
  }
};
