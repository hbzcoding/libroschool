import { User } from "./user";
import { School } from "./school";
import { PaginationMeta } from "./api";

export type ClassroomJoinPolicy = "open" | "code" | "approval";
export type ClassroomVisibility = "public" | "private";
export type ClassroomStatus = "active" | "locked" | "archived";
export type MemberRole = "owner" | "moderator" | "member";
export type MemberStatus = "active" | "pending" | "removed";

export interface Classroom {
  id: number;
  school: School;
  owner: User;
  name: string;
  description: string | null;
  grade: number;
  section: string;
  track: string | null;
  academic_year: string;
  join_code: string | null;
  join_policy: ClassroomJoinPolicy;
  visibility: ClassroomVisibility;
  is_verified: boolean;
  status: ClassroomStatus;
  members_count: number;
  created_at: string;
  updated_at: string;
}

export interface ClassroomMember {
  id: number;
  user: User;
  role: MemberRole;
  status: MemberStatus;
  created_at: string;
}

export interface ClassroomsPaginatedResponse {
  data: Classroom[];
  meta: PaginationMeta;
}

export interface ClassroomMembersPaginatedResponse {
  data: ClassroomMember[];
  meta: PaginationMeta;
}

export interface ClassroomsFilters {
  search?: string;
  school_id?: number;
  grade?: number;
  academic_year?: string;
  is_private?: boolean;
  page?: number;
  per_page?: number;
}

export interface CreateClassroomData {
  school_id: number;
  academic_year: string;
  grade: number;
  section: string;
  name?: string;
  description?: string;
  track?: string | null;
  join_policy?: ClassroomJoinPolicy;
  visibility?: ClassroomVisibility;
}

export interface UpdateClassroomData {
  name?: string;
  description?: string;
  join_policy?: ClassroomJoinPolicy;
  visibility?: ClassroomVisibility;
}

export interface JoinByCodeData {
  join_code: string;
}

export interface UpdateMemberRoleData {
  role: MemberRole;
}

export const JOIN_POLICY_LABELS: Record<ClassroomJoinPolicy, string> = {
  open: "Open",
  code: "Code Required",
  approval: "Approval Required",
};

export const VISIBILITY_LABELS: Record<ClassroomVisibility, string> = {
  public: "Public",
  private: "Private",
};

export const CLASSROOM_STATUS_LABELS: Record<ClassroomStatus, string> = {
  active: "Active",
  locked: "Locked",
  archived: "Archived",
};

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  owner: "Owner",
  moderator: "Moderator",
  member: "Member",
};

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: "Active",
  pending: "Pending",
  removed: "Removed",
};
