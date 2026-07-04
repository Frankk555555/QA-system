import { prisma } from "@/lib/prisma";
import { Prisma, BugStatus } from "@prisma/client";
import type { BugFilters, PaginatedResponse } from "@/types";
import { generateBugCode } from "@/lib/utils";

export async function getBugs(filters: BugFilters): Promise<PaginatedResponse<Record<string, unknown>>> {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const where: Prisma.BugReportWhereInput = {};

  if (filters.status) where.status = filters.status as BugStatus;
  if (filters.severity) where.severity = filters.severity as Prisma.EnumBugSeverityFilter;
  if (filters.priority) where.priority = filters.priority as Prisma.EnumBugPriorityFilter;
  if (filters.projectId) where.projectId = filters.projectId;
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;
  if (filters.reporterId) where.reporterId = filters.reporterId;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { bugCode: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.BugReportOrderByWithRelationInput = {};
  if (filters.sortBy) {
    orderBy[filters.sortBy as keyof Prisma.BugReportOrderByWithRelationInput] =
      (filters.sortOrder || "desc") as Prisma.SortOrder;
  } else {
    orderBy.createdAt = "desc";
  }

  const [data, total] = await Promise.all([
    prisma.bugReport.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        project: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true, avatar: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
        _count: { select: { comments: true, attachments: true } },
      },
    }),
    prisma.bugReport.count({ where }),
  ]);

  return {
    data: data as unknown as Record<string, unknown>[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getBugById(id: string) {
  return prisma.bugReport.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, name: true } },
      build: true,
      reporter: { select: { id: true, name: true, email: true, avatar: true, role: true } },
      assignedTo: { select: { id: true, name: true, email: true, avatar: true, role: true } },
      attachments: {
        include: { uploader: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      comments: {
        include: {
          user: { select: { id: true, name: true, avatar: true, role: true } },
          replies: {
            include: {
              user: { select: { id: true, name: true, avatar: true, role: true } },
            },
          },
        },
        where: { parentId: null },
        orderBy: { createdAt: "asc" },
      },
      activityLogs: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
      },
      environmentInfo: true,
      gameSession: true,
    },
  });
}

export async function createBug(data: {
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
  severity: string;
  priority: string;
  projectId: string;
  buildId?: string;
  assignedToId?: string;
  reporterId: string;
  environmentInfo?: Record<string, unknown>;
  gameSession?: Record<string, unknown>;
}) {
  const lastBug = await prisma.bugReport.findFirst({
    orderBy: { bugCode: "desc" },
    select: { bugCode: true },
  });

  const bugCode = generateBugCode(lastBug?.bugCode);

  const { environmentInfo, gameSession, ...bugData } = data;

  const bug = await prisma.bugReport.create({
    data: {
      ...bugData,
      bugCode,
      severity: bugData.severity as Prisma.EnumBugSeverityFieldUpdateOperationsInput["set"] & string,
      priority: bugData.priority as Prisma.EnumBugPriorityFieldUpdateOperationsInput["set"] & string,
      status: "NEW",
      environmentInfo: environmentInfo
        ? { create: environmentInfo as Prisma.EnvironmentInfoCreateWithoutBugInput }
        : undefined,
      gameSession: gameSession
        ? { create: gameSession as Prisma.GameSessionCreateWithoutBugInput }
        : undefined,
    } as unknown as Prisma.BugReportCreateInput,
    include: {
      project: { select: { name: true } },
      reporter: { select: { name: true } },
    },
  });

  // Create activity log
  await prisma.activityLog.create({
    data: {
      bugId: bug.id,
      userId: data.reporterId,
      action: "Created Bug",
      newValue: bugCode,
    },
  });

  return bug;
}

export async function updateBugStatus(
  bugId: string,
  status: string,
  userId: string
) {
  const bug = await prisma.bugReport.findUnique({
    where: { id: bugId },
    select: { status: true },
  });

  if (!bug) throw new Error("Bug not found");

  const updated = await prisma.bugReport.update({
    where: { id: bugId },
    data: { status: status as BugStatus },
  });

  await prisma.activityLog.create({
    data: {
      bugId,
      userId,
      action: "Status Changed",
      oldValue: bug.status,
      newValue: status,
    },
  });

  return updated;
}
