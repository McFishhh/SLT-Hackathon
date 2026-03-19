import { Announcement, UserProfile } from "@/types";

export const mockCurrentUser: UserProfile = {
  id: "user-001",
  displayName: "Jamie Koh",
  email: "jamie@bigcommunity.app",
  role: "member",
  interests: ["Events", "Family", "Wellness"],
  signedUpEventIds: ["announce-001"]
};

export const mockAnnouncements: Announcement[] = [
  {
    id: "announce-001",
    title: "Town Hall Gathering for New Members",
    summary: "A welcome session introducing new members to community leaders, upcoming plans, and support channels.",
    body: "Join us on Saturday evening for a relaxed town hall gathering. We will introduce the moderation team, share the calendar for the next quarter, and collect feedback on what members want from BigCommunity. This is a good first event for anyone who recently registered and wants to understand how announcements, events, and member support will work together on the platform.",
    category: "Event",
    authorName: "Community Team",
    audience: ["admin", "member", "organiser"],
    tags: ["events", "updates"],
    publishedAt: "18 Mar 2026"
  },
  {
    id: "announce-002",
    title: "Volunteer Registration Opens Next Week",
    summary: "Members can soon register for neighborhood support, logistics, and event coordination opportunities.",
    body: "Volunteer registration will open next week with role categories for logistics, outreach, and event operations. The long-term plan is to let Firebase persist volunteer interests and then filter relevant announcements based on those preferences. This starter already includes a shared user profile shape so those variables can move across screens clearly.",
    category: "Volunteer",
    authorName: "Operations Desk",
    audience: ["admin", "member", "organiser"],
    tags: ["volunteers", "updates"],
    publishedAt: "17 Mar 2026"
  },
  {
    id: "announce-003",
    title: "Website Framework Ready for Announcement Publishing",
    summary: "This starter demonstrates a home page, listing flow, detail routes, and Firebase-ready service boundaries.",
    body: "The initial framework is designed for clarity over cleverness. Announcement models, user profiles, reducer actions, and service calls are intentionally explicit so future contributors can follow the information flow without guessing. As the project grows, these files should make it easier to add admin publishing tools, notifications, and moderation logic.",
    category: "Platform",
    authorName: "Product Team",
    audience: ["admin", "member", "organiser"],
    tags: ["updates", "wellness"],
    publishedAt: "16 Mar 2026"
  }
];
