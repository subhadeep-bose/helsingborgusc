/** Centralized React Query key factory – keeps cache keys consistent everywhere. */
export const queryKeys = {
  announcements: {
    all: ["announcements"] as const,
    latest: (limit: number) => ["announcements", "latest", limit] as const,
  },
  boardMembers: {
    all: ["board-members"] as const,
  },
  members: {
    all: ["members"] as const,
    approved: ["members", "approved"] as const,
    byUser: (userId: string) => ["members", "byUser", userId] as const,
  },
  scheduleEntries: {
    all: ["schedule-entries"] as const,
  },
  galleryImages: {
    all: ["gallery-images"] as const,
  },
  contactMessages: {
    all: ["contact-messages"] as const,
  },
  userRoles: {
    all: ["user-roles"] as const,
  },
  clubStats: {
    all: ["club-stats"] as const,
  },
  nextEvent: {
    all: ["next-event"] as const,
  },
};
