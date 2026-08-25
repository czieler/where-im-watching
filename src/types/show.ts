export type ShowStatus = "watching" | "wantToWatch" | "completed" | "onHold";

export type Show = {
  id: number;
  title: string;
  service: string;
  imageUrl?: string;
};

export type NewShow = Show & {
  status: ShowStatus;
};
