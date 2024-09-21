import { RegistrationSteps } from "../modules/registration.module/registration.service";
import { prisma } from "./prisma.client";
import { connect } from "http2";

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
      data,
    });
  }

  async getAllUsers() {
    return await prisma.user.findMany();
  }
  async createTeamMember(chatId: number, data: any) {
    const user = await prisma.user.findUnique({
      where: {
        userId: chatId,
      },
    });
    const teamMember = await prisma.teamMember.create({
      data: {
        userData: data,
        user: {
          connect: {
            id: user?.id,
          },
        },
      },
    });
    return teamMember;
  }

  async getTeamMember(userId: number) {
    const user = await prisma.user.findUnique({
      where: {
        userId,
      },
    });
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId: user!.id,
      },
    });
    return teamMember;
  }

  async getTeamFromDb(chatId: number) {
    const teamMember = await this.getTeamMember(chatId);
    if (teamMember === null) {
      return null;
    } else {
      const team = await prisma.team.findUnique({
        where: {
          id: teamMember.teamId!,
        },
      });
      return team;
    }
  }

  async getTeamMembers(chatId: number) {
    const team = await this.getTeamFromDb(chatId);
    const teamID = team?.id;

    const members = await prisma.teamMember.findMany({
      where: {
        teamId: teamID,
      },
    });

    return members;
  }
}
