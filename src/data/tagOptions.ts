import { AnnouncementTag, UserRole } from "@/types";

export const roleOptions: { label: string; value: UserRole }[] = [
  { label: "Admin", value: "admin" },
  { label: "Members", value: "member" },
  { label: "Organiser", value: "organiser" }
];

export const roleDescriptions: Record<UserRole, { title: string; description: string }> = {
  admin: {
    title: "Admin access",
    description: "Admins can create and manage tags so the platform taxonomy stays consistent."
  },
  member: {
    title: "Member access",
    description: "Members can choose the tags they are interested in and receive messages that match those tags."
  },
  organiser: {
    title: "Organiser access",
    description: "Organisers can select existing tags and assign them to community messages and announcements."
  }
};

export const availableTags: AnnouncementTag[] = [
  {
    id: "events",
    label: "Events",
    description: "Community activities, meetups, and special programmes."
  },
  {
    id: "volunteers",
    label: "Volunteers",
    description: "Volunteer recruitment, duty calls, and coordination updates."
  },
  {
    id: "wellness",
    label: "Wellness",
    description: "Health, support, and wellbeing-related announcements."
  },
  {
    id: "updates",
    label: "General Updates",
    description: "Broad platform or neighbourhood updates for the community."
  },
  {
    id: "family",
    label: "Family",
    description: "Family-focused activities, services, and reminders."
  }
];
