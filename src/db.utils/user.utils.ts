import { RegistrationSteps } from "../modules/registration.module/registration.service";
import { prisma } from "./prisma.client";

export interface IUserData {
  registrationStep: RegistrationSteps;
}
export class UserDb {
  async createUser(userId: number) {
    return await prisma.user.create({
      data: {
        userId,
      },
    });
  }

  async getUser(userId: number) {
    return await prisma.user.findUnique({
      where: {
        userId,
      },
    });
  }

  async updateUser(userId: number, data: any) {
    return await prisma.user.update({
      where: {
        userId,
      },
      data
    });
  }

  async getAllUsers() {
    return await prisma.user.findMany();
  }
  async createTeamMember(userId: number, data: any) {

    return await prisma.teamMember.create({
      data: {
        ...data,
        userId: userId.toString(),
      }
    })
  }
}
