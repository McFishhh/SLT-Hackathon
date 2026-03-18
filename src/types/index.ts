import { Dispatch } from "react";

export type UserRole = "admin" | "member" | "organiser";

export type AnnouncementTag = {
  id: string;
  label: string;
  description: string;
};

export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  interests: string[];
};

export type UserRegistrationInput = {
  displayName: string;
  email: string;
  password: string;
  role: UserRole;
  interests: string[];
};

export type UserLoginInput = {
  email: string;
  password: string;
  role: UserRole;
};

export type Announcement = {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  authorName: string;
  audience: UserRole[];
  tags: string[];
  publishedAt: string;
};

export type AppState = {
  announcements: Announcement[];
  currentUser: UserProfile | null;
  selectedAnnouncementId: string | null;
  isLoading: boolean;
};

export type AppAction =
  | {
      type: "SET_LOADING";
      payload: boolean;
    }
  | {
      type: "SET_CURRENT_USER";
      payload: UserProfile | null;
    }
  | {
      type: "SET_ANNOUNCEMENTS";
      payload: Announcement[];
    }
  | {
      type: "SET_SELECTED_ANNOUNCEMENT";
      payload: string | null;
    };

export type AppContextValue = {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  setSelectedAnnouncement: (announcementId: string | null) => void;
  setCurrentUser: (user: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
};
