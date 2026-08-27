export type ShowStatus = "watching" | "wantToWatch" | "completed" | "onHold";

export type Show = {
  id: number;
  title: string;
  service: string;
  imageUrl?: string;
  season?: number;
  episode?: number;
};

export type NewShow = Show & {
  status: ShowStatus;
};
