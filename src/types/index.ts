import { Dispatch } from "react";

export type UserRole = "admin" | "member" | "organiser";

export type TagId = string;

export type Tag = {
  id: TagId;
  label: string;
  description: string;
};

export type AnnouncementTag = Tag;

export type TagInput = {
  label: string;
  description: string;
};

export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  interests: TagId[];
  signedUpEventIds: string[];
};

export type UserRegistrationInput = {
  displayName: string;
  email: string;
  password: string;
  role: UserRole;
  interests: TagId[];
};

export type UserLoginInput = {
  email: string;
  password: string;
};

export type CreateAnnouncementInput = {
  title: string;
  tags: TagId[];
  authorName: string;
  body?: string;
  description?: string;
  summary?: string;
  category?: string;
  audience?: UserRole[];
};

export type Announcement = {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  authorName: string;
  audience: UserRole[];
  tags: TagId[];
  publishedAt: string;
};

export type AnnouncementInput = {
  title: string;
  summary: string;
  body: string;
  category: string;
  audience: UserRole[];
  tags: TagId[];
};

export type AppState = {
  announcements: Announcement[];
  tags: Tag[];
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
    }
  | {
      type: "CREATE_ANNOUNCEMENT";
      payload: Announcement;
    }
  | {
      type: "UPDATE_ANNOUNCEMENT";
      payload: Announcement;
    }
  | {
      type: "DELETE_ANNOUNCEMENT";
      payload: string;
    }
  | {
      type: "UPDATE_CURRENT_USER_INTERESTS";
      payload: TagId[];
    }
  | {
      type: "CREATE_TAG";
      payload: Tag;
    }
  | {
      type: "UPDATE_TAG";
      payload: Tag;
    }
  | {
      type: "DELETE_TAG";
      payload: TagId;
    };

export type AppContextValue = {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  setAnnouncements: (announcements: Announcement[]) => void;
  setSelectedAnnouncement: (announcementId: string | null) => void;
  setCurrentUser: (user: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  createAnnouncement: (input: AnnouncementInput) => void;
  updateAnnouncement: (announcementId: string, input: AnnouncementInput) => void;
  deleteAnnouncement: (announcementId: string) => void;
  updateCurrentUserInterests: (interests: TagId[]) => void;
  createTag: (input: TagInput) => void;
  updateTag: (tagId: TagId, input: TagInput) => void;
  deleteTag: (tagId: TagId) => void;
};
