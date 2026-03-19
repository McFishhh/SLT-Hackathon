import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore";

import { firebaseDb } from "@/lib/firebase";

type SignupPayload = {
  eventId: string;
  name: string;
  email: string;
  userId: string | null;
};

export async function submitSignup(payload: SignupPayload) {
  if (!payload.userId) {
    throw new Error("Please log in before signing up for an event.");
  }

  const alreadySignedUp = await checkIfSignedUp(payload.eventId, payload.userId);

  if (alreadySignedUp) {
    throw new Error("You have already signed up for this event.");
  }

  const signupsRef = collection(firebaseDb, "events", payload.eventId, "signups");
  const signupRef = doc(signupsRef);
  const userRef = doc(firebaseDb, "users", payload.userId);

  const batch = writeBatch(firebaseDb);

  batch.set(signupRef, {
    name: payload.name,
    email: payload.email,
    userId: payload.userId,
    signedUpAt: serverTimestamp()
  });

  batch.update(userRef, {
    signedUpEventIds: arrayUnion(payload.eventId)
  });

  await batch.commit();
}

export async function checkIfSignedUp(eventId: string, userId: string | null): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const signupsRef = collection(firebaseDb, "events", eventId, "signups");
  const signupQuery = query(signupsRef, where("userId", "==", userId));
  const snapshot = await getDocs(signupQuery);

  return !snapshot.empty;
}
