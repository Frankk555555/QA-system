import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getProjects() {
  return prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { bugs: true, builds: true },
      },
      bugs: {
        select: { status: true },
      },
    },
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      builds: { orderBy: { createdAt: "desc" } },
      _count: { select: { bugs: true, builds: true } },
      bugs: {
        select: { status: true, severity: true, priority: true, createdAt: true },
      },
    },
  });
}

export async function createProject(data: { name: string; description?: string }) {
  return prisma.project.create({ data: data as Prisma.ProjectCreateInput });
}

export async function updateProject(id: string, data: { name?: string; description?: string; status?: string }) {
  return prisma.project.update({
    where: { id },
    data: data as Prisma.ProjectUpdateInput,
  });
}

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}

export async function createBuild(data: {
  projectId: string;
  version: string;
  platform: string;
  releaseDate?: string;
}) {
  return prisma.builds.create({
    data: {
      projectId: data.projectId,
      version: data.version,
      platform: data.platform as Prisma.EnumPlatformFieldUpdateOperationsInput["set"] & string,
      releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
    } as unknown as Prisma.BuildsCreateInput,
  });
}
