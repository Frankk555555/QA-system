import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
      _count: {
        select: {
          reportedBugs: true,
          assignedBugs: true,
        },
      },
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
      _count: {
        select: {
          reportedBugs: true,
          assignedBugs: true,
          comments: true,
        },
      },
    },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  const hashedPassword = await hash(data.password, 12);
  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      role: data.role as Prisma.EnumUserRoleFieldUpdateOperationsInput["set"] & string,
    } as unknown as Prisma.UserCreateInput,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; role?: string }
) {
  return prisma.user.update({
    where: { id },
    data: data as Prisma.UserUpdateInput,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}

export async function getDevelopers() {
  return prisma.user.findMany({
    where: { role: "DEVELOPER" },
    select: { id: true, name: true, avatar: true },
  });
}
