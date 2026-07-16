export type WorldEventKind =
  | "system"
  | "user-action"
  | "physics"
  | "society"
  | "warning";

export type WorldEventImportance = "low" | "medium" | "high";

export type WorldEvent = {
  id: string;
  kind: WorldEventKind;
  message: string;
  importance: WorldEventImportance;
  createdAt: number;
};
