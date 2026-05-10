import { User } from "./user";

export type ReportableType = "Book" | "BookRequest" | "Note" | "Classroom" | "User";

export type ReportStatus = "open" | "reviewed" | "dismissed";

export interface Report {
  id: number;
  reporter: User;
  target_type: ReportableType;
  target_id: number;
  reason: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateReportData {
  target_type: ReportableType;
  target_id: number;
  reason: string;
}
