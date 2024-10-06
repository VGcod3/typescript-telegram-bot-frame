import { prisma } from "./prisma.client";

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
    await prisma.teamMember.create({
      data: {
        userData: data,
        user: {
          connect: {
            id: user?.id,
          },
        },
      },
    });
  }

  async getTeamMember(userId: number) {
    const user = await prisma.user.findUnique({
      where: {
        userId,
      },
    });
    if (user !== null) {
      const teamMember = await prisma.teamMember.findUnique({
        where: {
          userId: user!.id,
        },
      });
      return teamMember;
    } else {
      return null;
    }
  }

  async getTeamFromDb(chatId: number) {
    const teamMember = await this.getTeamMember(chatId);
    if (teamMember === null) {
      return null;
    } else {
      const teamId = teamMember.teamId;
      if (teamId !== null) {
        const team = await prisma.team.findUnique({
          where: {
            id: teamId,
          },
        });
        return team;
      }
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
