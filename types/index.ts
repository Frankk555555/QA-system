import { z } from "zod";

// ============================================================================
// Enums (mirror Prisma enums for client-side use)
// ============================================================================

export const UserRole = {
  ADMIN: "ADMIN",
  QA_TESTER: "QA_TESTER",
  DEVELOPER: "DEVELOPER",
  PRODUCER: "PRODUCER",
  VIEWER: "VIEWER",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ProjectStatus = {
  ACTIVE: "ACTIVE",
  MAINTENANCE: "MAINTENANCE",
  ARCHIVED: "ARCHIVED",
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const Platform = {
  WINDOWS: "WINDOWS",
  STEAM: "STEAM",
  EPIC_GAMES: "EPIC_GAMES",
  PLAYSTATION: "PLAYSTATION",
  XBOX: "XBOX",
  NINTENDO_SWITCH: "NINTENDO_SWITCH",
  ANDROID: "ANDROID",
  IOS: "IOS",
} as const;
export type Platform = (typeof Platform)[keyof typeof Platform];

export const BugSeverity = {
  CRITICAL: "CRITICAL",
  MAJOR: "MAJOR",
  MEDIUM: "MEDIUM",
  MINOR: "MINOR",
  TRIVIAL: "TRIVIAL",
} as const;
export type BugSeverity = (typeof BugSeverity)[keyof typeof BugSeverity];

export const BugPriority = {
  HIGHEST: "HIGHEST",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
} as const;
export type BugPriority = (typeof BugPriority)[keyof typeof BugPriority];

export const BugStatus = {
  NEW: "NEW",
  OPEN: "OPEN",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  FIXED: "FIXED",
  READY_FOR_TEST: "READY_FOR_TEST",
  VERIFIED: "VERIFIED",
  CLOSED: "CLOSED",
  REJECTED: "REJECTED",
  DUPLICATE: "DUPLICATE",
} as const;
export type BugStatus = (typeof BugStatus)[keyof typeof BugStatus];

// ============================================================================
// Display Labels
// ============================================================================

export const UserRoleLabels: Record<UserRole, string> = {
  ADMIN: "Admin",
  QA_TESTER: "QA Tester",
  DEVELOPER: "Developer",
  PRODUCER: "Producer",
  VIEWER: "Viewer",
};

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  ACTIVE: "Active",
  MAINTENANCE: "Maintenance",
  ARCHIVED: "Archived",
};

export const PlatformLabels: Record<Platform, string> = {
  WINDOWS: "Windows",
  STEAM: "Steam",
  EPIC_GAMES: "Epic Games",
  PLAYSTATION: "PlayStation",
  XBOX: "Xbox",
  NINTENDO_SWITCH: "Nintendo Switch",
  ANDROID: "Android",
  IOS: "iOS",
};

export const BugSeverityLabels: Record<BugSeverity, string> = {
  CRITICAL: "Critical",
  MAJOR: "Major",
  MEDIUM: "Medium",
  MINOR: "Minor",
  TRIVIAL: "Trivial",
};

export const BugPriorityLabels: Record<BugPriority, string> = {
  HIGHEST: "Highest",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const BugStatusLabels: Record<BugStatus, string> = {
  NEW: "New",
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  FIXED: "Fixed",
  READY_FOR_TEST: "Ready for Test",
  VERIFIED: "Verified",
  CLOSED: "Closed",
  REJECTED: "Rejected",
  DUPLICATE: "Duplicate",
};

// ============================================================================
// Zod Schemas
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum({ ...UserRole } as const),
  avatar: z.string().url().optional(),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial().omit({ password: true });
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().optional(),
  status: z.nativeEnum({ ...ProjectStatus } as const).optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const createBuildSchema = z.object({
  projectId: z.string().cuid(),
  version: z.string().min(1, "Version is required"),
  platform: z.nativeEnum({ ...Platform } as const),
  releaseDate: z.string().datetime().optional(),
});
export type CreateBuildInput = z.infer<typeof createBuildSchema>;

export const createBugSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  stepsToReproduce: z.string().optional(),
  expectedResult: z.string().optional(),
  actualResult: z.string().optional(),
  severity: z.nativeEnum({ ...BugSeverity } as const),
  priority: z.nativeEnum({ ...BugPriority } as const),
  projectId: z.string().cuid(),
  buildId: z.string().cuid().optional(),
  assignedToId: z.string().cuid().optional(),
  environmentInfo: z
    .object({
      os: z.string().optional(),
      cpu: z.string().optional(),
      gpu: z.string().optional(),
      ram: z.string().optional(),
      resolution: z.string().optional(),
      driverVersion: z.string().optional(),
      gameLanguage: z.string().optional(),
      fps: z.number().int().optional(),
    })
    .optional(),
  gameSession: z
    .object({
      map: z.string().optional(),
      mission: z.string().optional(),
      character: z.string().optional(),
      weapon: z.string().optional(),
      server: z.string().optional(),
      roomId: z.string().optional(),
    })
    .optional(),
});
export type CreateBugInput = z.infer<typeof createBugSchema>;

export const updateBugSchema = createBugSchema.partial();
export type UpdateBugInput = z.infer<typeof updateBugSchema>;

export const updateBugStatusSchema = z.object({
  status: z.nativeEnum({ ...BugStatus } as const),
});
export type UpdateBugStatusInput = z.infer<typeof updateBugStatusSchema>;

export const createCommentSchema = z.object({
  message: z.string().min(1, "Comment cannot be empty"),
  parentId: z.string().cuid().optional(),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BugFilters extends PaginationParams {
  status?: BugStatus;
  severity?: BugSeverity;
  priority?: BugPriority;
  projectId?: string;
  assignedToId?: string;
  reporterId?: string;
  search?: string;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardStats {
  totalBugs: number;
  openBugs: number;
  criticalBugs: number;
  fixedToday: number;
  totalProjects: number;
  totalUsers: number;
}

export interface BugStatusCount {
  status: string;
  count: number;
}

export interface BugTrend {
  date: string;
  opened: number;
  closed: number;
}

export interface SeverityCount {
  severity: string;
  count: number;
}

export interface PlatformCount {
  platform: string;
  count: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  bugCode: string;
  bugTitle: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
}
