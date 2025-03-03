import { Prisma } from "@prisma/client";
import { prisma } from "./prisma.client";
import { Logger } from "../modules/Logger";

export class UserDb {
  async createUser(userId: number) {
    try {
      return await prisma.user.create({
        data: {
          userId,
        },
      });
    } catch (error) {
      Logger.error(`Error creating user: ${error}`, "UserDb");
      return null;
    }
  }

  async getUser(userId: number) {
    try {
      return await prisma.user.findUnique({
        where: {
          userId,
        },
      });
    } catch (error) {
      Logger.error(`Error getting user: ${error}`, "UserDb");
      return null;
    }
  }

  async updateUser(userId: number, data: Prisma.UserUpdateInput) {
    try {
      return await prisma.user.update({
        where: {
          userId,
        },
        data,
      });
    } catch (error) {
      Logger.error(`Error updating user: ${error}`, "UserDb");
      return null;
    }
  }

  async getAllUsers() {
    try {
      return await prisma.user.findMany();
    } catch (error) {
      Logger.error(`Error getting all users: ${error}`, "UserDb");
      return [];
    }
  }
}
