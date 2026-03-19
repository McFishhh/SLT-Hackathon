import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";

import { mockAnnouncements } from "@/data/mockAnnouncements";
import { firebaseDb } from "@/lib/firebase";
import { Announcement, CreateAnnouncementInput, UserRole } from "@/types";

const announcementsCollection = collection(firebaseDb, "announcements");
const bootstrapDocRef = doc(firebaseDb, "appMeta", "announcementsBootstrap");

function normalizeAnnouncement(id: string, data: Partial<Announcement>): Announcement {
  return {
    id,
    title: data.title ?? "",
    summary: data.summary ?? "",
    body: data.body ?? "",
    category: data.category ?? "",
    authorName: data.authorName ?? "",
    audience: data.audience ?? [],
    tags: data.tags ?? [],
    publishedAt: data.publishedAt ?? ""
  };
}

function buildSummary(description: string): string {
  const compact = description.replace(/\s+/g, " ").trim();

  if (compact.length <= 140) {
    return compact;
  }

  return `${compact.slice(0, 137)}...`;
}

function formatPublishedAt(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

const allRoles: UserRole[] = ["admin", "member", "organiser"];

export const announcementService = {
  async ensureAnnouncementsBootstrapped(): Promise<void> {
    const bootstrapSnapshot = await getDoc(bootstrapDocRef);

    if (bootstrapSnapshot.exists()) {
      return;
    }

    const batch = writeBatch(firebaseDb);

    mockAnnouncements.forEach((announcement) => {
      batch.set(doc(firebaseDb, "announcements", announcement.id), announcement);
    });

    batch.set(bootstrapDocRef, {
      seededAt: new Date().toISOString(),
      seededCount: mockAnnouncements.length
    });

    await batch.commit();
  },

  async listAnnouncements(): Promise<Announcement[]> {
    const snapshot = await getDocs(announcementsCollection);

    return snapshot.docs.map((announcementDoc) =>
      normalizeAnnouncement(announcementDoc.id, announcementDoc.data() as Partial<Announcement>)
    );
  },

  async getAnnouncementById(id: string): Promise<Announcement | null> {
    const announcementSnapshot = await getDoc(doc(firebaseDb, "announcements", id));

    if (!announcementSnapshot.exists()) {
      return null;
    }

    return normalizeAnnouncement(id, announcementSnapshot.data() as Partial<Announcement>);
  },

  async createAnnouncement(input: CreateAnnouncementInput): Promise<Announcement> {
    const createdAt = new Date();
    const payload: Announcement = {
      id: "",
      title: input.title.trim(),
      summary: buildSummary(input.description),
      body: input.description.trim(),
      category: "Announcement",
      authorName: input.authorName,
      audience: allRoles,
      tags: input.tags,
      publishedAt: formatPublishedAt(createdAt)
    };

    const docRef = await addDoc(announcementsCollection, {
      ...payload,
      createdAt: serverTimestamp()
    });

    return {
      ...payload,
      id: docRef.id
    };
  }
};
