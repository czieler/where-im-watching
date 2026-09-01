export type ServiceModerationStatus = "verified" | "pending" | "rejected";

export type StreamingService = {
  id: string;
  name: string;
  normalizedName: string;
  moderationStatus: ServiceModerationStatus;
  submittedByUserId?: string | null;
  submissionCount?: number;
};
