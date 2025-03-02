import { Prisma } from "@prisma/client";
import { prisma } from "./prisma.client";

export class UserDb {
  async createUser(userId: number) {
    try {
      return await prisma.user.create({
        data: {
          userId,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getUser(userId: number) {
    return await prisma.user.findUnique({
      where: {
        userId,
      },
    });
  }

  async updateUser(userId: number, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({
      where: {
        userId,
      },
      data,
    });
  }

  async getAllUsers() {
    return await prisma.user.findMany();
  }
}
