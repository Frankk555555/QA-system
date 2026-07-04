import { Prisma, UserRole } from "@prisma/client";

export type RbacUser = { id: string; role: string } | undefined | null;

export function getRoleBasedBugFilter(
  user: RbacUser
): Prisma.BugReportWhereInput {
  if (!user) {
    // If no user is provided, deny all by matching a non-existent ID.
    return { id: "UNAUTHORIZED" };
  }

  // Developer can only see bugs assigned to them or reported by them
  if (user.role === UserRole.DEVELOPER) {
    return {
      OR: [
        { assignedToId: user.id },
        { reporterId: user.id },
      ],
    };
  }

  // QA Tester, Producer, Admin, Viewer can see all bugs
  return {};
}
