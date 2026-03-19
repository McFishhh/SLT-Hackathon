// lib/signupService.ts
import { addDoc, getDocs, collection, query, serverTimestamp, where } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase";

interface SignupPayload {
  eventId: string;
  name: string;
  email: string;
  userId: string | null;
}

export async function submitSignup(payload: SignupPayload) {
  const signupsRef = collection(firebaseDb, "events", payload.eventId, "signups");
  await addDoc(signupsRef, {
    name: payload.name,
    email: payload.email,
    userId: payload.userId,
    signedUpAt: serverTimestamp(),
  });
}

export async function checkIfSignedUp(eventId: string, userId: string | null): Promise<boolean> {
  if (!userId) return false; // if not logged in, can't check

  const signupsRef = collection(firebaseDb, "events", eventId, "signups");
  const q = query(signupsRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  return !snapshot.empty; 
}