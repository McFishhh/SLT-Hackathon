import { PropsWithChildren, createContext, useCallback, useContext, useMemo, useReducer } from "react";

import { availableTags } from "@/data/tagOptions";
import {
  Announcement,
  AnnouncementInput,
  AppAction,
  AppContextValue,
  AppState,
  Tag,
  TagId,
  TagInput,
  UserProfile,
  UserRole
} from "@/types";

const defaultAudience: UserRole[] = ["admin", "member", "organiser"];

function normalizeTagIds(tags: TagId[]): TagId[] {
  return Array.from(new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)));
}

function makeTagId(label: string): TagId {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function filterKnownTagIds(tags: TagId[], knownTags: Tag[]): TagId[] {
  const validTagIds = new Set(knownTags.map((tag) => tag.id));

  return normalizeTagIds(tags).filter((tagId) => validTagIds.has(tagId));
}

function formatPublishedDate() {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function sanitizeUserProfile(user: UserProfile, knownTags: Tag[]): UserProfile {
  return {
    ...user,
    interests: filterKnownTagIds(user.interests, knownTags),
    signedUpEventIds: user.signedUpEventIds ?? []
  };
}

const initialState: AppState = {
  announcements: [],
  tags: availableTags,
  currentUser: null,
  selectedAnnouncementId: null,
  isLoading: false
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload
      };
    case "SET_CURRENT_USER":
      return {
        ...state,
        currentUser: action.payload
      };
    case "SET_ANNOUNCEMENTS":
      return {
        ...state,
        announcements: action.payload
      };
    case "SET_SELECTED_ANNOUNCEMENT":
      return {
        ...state,
        selectedAnnouncementId: action.payload
      };
    case "CREATE_ANNOUNCEMENT":
      return {
        ...state,
        announcements: [action.payload, ...state.announcements]
      };
    case "UPDATE_ANNOUNCEMENT":
      return {
        ...state,
        announcements: state.announcements.map((announcement) =>
          announcement.id === action.payload.id ? action.payload : announcement
        )
      };
    case "DELETE_ANNOUNCEMENT": {
      const nextAnnouncements = state.announcements.filter((announcement) => announcement.id !== action.payload);
      const nextSelectedAnnouncementId =
        state.selectedAnnouncementId === action.payload ? (nextAnnouncements[0]?.id ?? null) : state.selectedAnnouncementId;

      return {
        ...state,
        announcements: nextAnnouncements,
        selectedAnnouncementId: nextSelectedAnnouncementId
      };
    }
    case "UPDATE_CURRENT_USER_INTERESTS": {
      if (!state.currentUser) {
        return state;
      }

      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          interests: filterKnownTagIds(action.payload, state.tags)
        }
      };
    }
    case "CREATE_TAG":
      return {
        ...state,
        tags: [...state.tags, action.payload]
      };
    case "UPDATE_TAG":
      return {
        ...state,
        tags: state.tags.map((tag) => (tag.id === action.payload.id ? action.payload : tag))
      };
    case "DELETE_TAG": {
      const nextTags = state.tags.filter((tag) => tag.id !== action.payload);
      const nextAnnouncements = state.announcements.map((announcement) => ({
        ...announcement,
        tags: announcement.tags.filter((tagId) => tagId !== action.payload)
      }));

      return {
        ...state,
        tags: nextTags,
        announcements: nextAnnouncements,
        currentUser: state.currentUser
          ? {
              ...state.currentUser,
              interests: state.currentUser.interests.filter((tagId) => tagId !== action.payload)
            }
          : null
      };
    }
    default:
      return state;
  }
}

export function AppProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setCurrentUser = useCallback(
    (user: AppState["currentUser"]) =>
      dispatch({
        type: "SET_CURRENT_USER",
        payload: user ? sanitizeUserProfile(user, state.tags) : null
      }),
    [state.tags]
  );

  const setAnnouncements = useCallback(
    (announcements: AppState["announcements"]) =>
      dispatch({
        type: "SET_ANNOUNCEMENTS",
        payload: announcements
      }),
    []
  );

  const setLoading = useCallback(
    (isLoading: boolean) =>
      dispatch({
        type: "SET_LOADING",
        payload: isLoading
      }),
    []
  );

  const setSelectedAnnouncement = useCallback(
    (announcementId: string | null) =>
      dispatch({
        type: "SET_SELECTED_ANNOUNCEMENT",
        payload: announcementId
      }),
    []
  );

  const createAnnouncement = useCallback(
    (input: AnnouncementInput) => {
      const announcement: Announcement = {
        id: `announce-${Date.now()}`,
        title: input.title.trim(),
        summary: input.summary.trim(),
        body: input.body.trim(),
        category: input.category.trim() || "Event",
        authorName: state.currentUser?.displayName ?? "Organiser Team",
        audience: input.audience.length > 0 ? input.audience : defaultAudience,
        tags: filterKnownTagIds(input.tags, state.tags),
        publishedAt: formatPublishedDate()
      };

      dispatch({
        type: "CREATE_ANNOUNCEMENT",
        payload: announcement
      });

      dispatch({
        type: "SET_SELECTED_ANNOUNCEMENT",
        payload: announcement.id
      });
    },
    [state.currentUser?.displayName, state.tags]
  );

  const updateAnnouncement = useCallback(
    (announcementId: string, input: AnnouncementInput) => {
      const existingAnnouncement = state.announcements.find((announcement) => announcement.id === announcementId);

      if (!existingAnnouncement) {
        return;
      }

      const nextAnnouncement: Announcement = {
        ...existingAnnouncement,
        title: input.title.trim(),
        summary: input.summary.trim(),
        body: input.body.trim(),
        category: input.category.trim() || "Event",
        audience: input.audience.length > 0 ? input.audience : defaultAudience,
        tags: filterKnownTagIds(input.tags, state.tags)
      };

      dispatch({
        type: "UPDATE_ANNOUNCEMENT",
        payload: nextAnnouncement
      });
    },
    [state.announcements, state.tags]
  );

  const deleteAnnouncement = useCallback(
    (announcementId: string) =>
      dispatch({
        type: "DELETE_ANNOUNCEMENT",
        payload: announcementId
      }),
    []
  );

  const updateCurrentUserInterests = useCallback(
    (interests: TagId[]) =>
      dispatch({
        type: "UPDATE_CURRENT_USER_INTERESTS",
        payload: interests
      }),
    []
  );

  const createTag = useCallback(
    (input: TagInput) => {
      const cleanLabel = input.label.trim();
      const cleanDescription = input.description.trim();
      const baseTagId = makeTagId(cleanLabel) || `tag-${state.tags.length + 1}`;
      const existingIds = new Set(state.tags.map((tag) => tag.id));
      let candidateId = baseTagId;
      let suffix = 2;

      while (existingIds.has(candidateId)) {
        candidateId = `${baseTagId}-${suffix}`;
        suffix += 1;
      }

      dispatch({
        type: "CREATE_TAG",
        payload: {
          id: candidateId,
          label: cleanLabel || candidateId,
          description: cleanDescription || "User-defined tag"
        }
      });
    },
    [state.tags]
  );

  const updateTag = useCallback(
    (tagId: TagId, input: TagInput) => {
      const existingTag = state.tags.find((tag) => tag.id === tagId);

      if (!existingTag) {
        return;
      }

      dispatch({
        type: "UPDATE_TAG",
        payload: {
          ...existingTag,
          label: input.label.trim() || existingTag.label,
          description: input.description.trim() || existingTag.description
        }
      });
    },
    [state.tags]
  );

  const deleteTag = useCallback(
    (tagId: TagId) =>
      dispatch({
        type: "DELETE_TAG",
        payload: tagId
      }),
    []
  );

  const value: AppContextValue = useMemo(
    () => ({
      state,
      dispatch,
      setCurrentUser,
      setAnnouncements,
      setLoading,
      setSelectedAnnouncement,
      createAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      updateCurrentUserInterests,
      createTag,
      updateTag,
      deleteTag
    }),
    [
      state,
      setCurrentUser,
      setAnnouncements,
      setLoading,
      setSelectedAnnouncement,
      createAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      updateCurrentUserInterests,
      createTag,
      updateTag,
      deleteTag
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }

  return context;
}
