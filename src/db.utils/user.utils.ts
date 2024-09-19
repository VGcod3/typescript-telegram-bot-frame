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
      data
    });
  }

  async getAllUsers() {
    return await prisma.user.findMany();
  }
  async createTeamMember(chatId: number, data: any) {
    const user = await prisma.user.findUnique({
      where: {
        userId: chatId,
      }
    })
    return await prisma.teamMember.create({
      
      data: {
        userData: data,
        user: {
          connect: {
            id: user?.id,
          }
        }
      }

    })
  }

  async getTeamMember(userId: number) {
    const user = await prisma.user.findUnique({
      where: {
        userId,
      }
    })
    if(user?.id !== null){
      return prisma.teamMember.findUnique({
        where: {
          userId: user!.id,
        }
      })
    } else {
      return null;
    }
  
  }
}
