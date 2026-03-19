import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";

import { mockAnnouncements } from "@/data/mockAnnouncements";
import { firebaseDb } from "@/lib/firebase";
import { Announcement, CreateAnnouncementInput, TagId, UserProfile, UserRole } from "@/types";

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

function normalizeTagIds(tags: TagId[]): TagId[] {
  return Array.from(new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)));
}

function hasTagMatch(announcementTags: TagId[], userTags: TagId[]): boolean {
  if (announcementTags.length === 0 || userTags.length === 0) {
    return false;
  }

  const userTagSet = new Set(normalizeTagIds(userTags));

  return normalizeTagIds(announcementTags).some((tag) => userTagSet.has(tag));
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

  async listAnnouncementsForUser(user: UserProfile | null, announcements: Announcement[] = mockAnnouncements): Promise<Announcement[]> {
    if (!user || user.role === "admin") {
      return announcements;
    }

    const roleVisibleAnnouncements = announcements.filter((announcement) => announcement.audience.includes(user.role));
    const relevantAnnouncements = roleVisibleAnnouncements.filter((announcement) => hasTagMatch(announcement.tags, user.interests));

    return relevantAnnouncements;
  },

  async listTagMatchedAnnouncementsForUser(user: UserProfile | null, announcements: Announcement[] = mockAnnouncements): Promise<Announcement[]> {
    if (!user) {
      return [];
    }

    return this.listAnnouncementsForUser(user, announcements);
  },

  async createAnnouncement(input: CreateAnnouncementInput): Promise<Announcement> {
    const cleanTitle = input.title.trim();
    const cleanBody = (input.body ?? input.description ?? "").trim();
    const cleanTags = normalizeTagIds(input.tags);

    if (!cleanTitle || !cleanBody) {
      throw new Error("Title and details are required to create an announcement.");
    }

    if (cleanTags.length === 0) {
      throw new Error("Select at least one related tag.");
    }

    const createdAt = new Date();
    const payload: Omit<Announcement, "id"> = {
      title: cleanTitle,
      summary: input.summary?.trim() || buildSummary(cleanBody),
      body: cleanBody,
      category: input.category?.trim() || "Announcement",
      authorName: input.authorName,
      audience: input.audience && input.audience.length > 0 ? input.audience : allRoles,
      tags: cleanTags,
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
