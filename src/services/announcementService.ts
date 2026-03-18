import { mockAnnouncements } from "@/data/mockAnnouncements";
import { Announcement, TagId, UserProfile } from "@/types";

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

export const announcementService = {
  async listAnnouncements(): Promise<Announcement[]> {
    return Promise.resolve(mockAnnouncements);
  },

  async getAnnouncementById(id: string): Promise<Announcement | null> {
    const announcement = mockAnnouncements.find((item) => item.id === id) ?? null;
    return Promise.resolve(announcement);
  },

  async listAnnouncementsForUser(user: UserProfile | null, announcements: Announcement[] = mockAnnouncements): Promise<Announcement[]> {
    if (!user) {
      return Promise.resolve(announcements);
    }

    const roleVisibleAnnouncements = announcements.filter((announcement) => announcement.audience.includes(user.role));
    return Promise.resolve(roleVisibleAnnouncements);
  },

  async listTagMatchedAnnouncementsForUser(user: UserProfile | null, announcements: Announcement[] = mockAnnouncements): Promise<Announcement[]> {
    if (!user) {
      return Promise.resolve([]);
    }

    const tagMatchedAnnouncements = announcements.filter(
      (announcement) => announcement.audience.includes(user.role) && hasTagMatch(announcement.tags, user.interests)
    );

    return Promise.resolve(tagMatchedAnnouncements);
  }
};
