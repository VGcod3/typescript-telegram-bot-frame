import { UserDb } from "../user.db";
import { prisma } from "../prisma.client";
import { Logger } from "../../modules/Logger";
import { User } from "../../interfaces/user";

jest.mock("../prisma.client", () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock("../../modules/Logger", () => ({
  Logger: {
    error: jest.fn(),
  },
}));

describe("UserDb", () => {
  let userDb: UserDb;
  const mockUser: User = {
    id: "1",
    userId: 123,
    data: {},
    currentScene: "scene1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    userDb = new UserDb();
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create user successfully", async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await userDb.createUser(123);

      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { userId: 123 },
      });
    });

    it("should return null and log error when creation fails", async () => {
      (prisma.user.create as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await userDb.createUser(123);

      expect(result).toBeNull();
      expect(Logger.error).toHaveBeenCalledWith(
        "Error creating user: Error: Database error",
        "UserDb",
      );
    });

    it("should handle invalid userId", async () => {
      (prisma.user.create as jest.Mock).mockRejectedValue(
        new Error("Invalid input"),
      );

      const result = await userDb.createUser(-1);

      expect(result).toBeNull();
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe("getUser", () => {
    it("should get user by userId", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userDb.getUser(123);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userId: 123 },
      });
    });

    it("should return null when user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userDb.getUser(999);

      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await userDb.getUser(123);

      expect(result).toBeNull();
      expect(Logger.error).toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await userDb.updateUser(123, { currentScene: "scene2" });

      expect(result).toEqual(mockUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { userId: 123 },
        data: { currentScene: "scene2" },
      });
    });

    it("should return null and log error when update fails", async () => {
      (prisma.user.update as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await userDb.updateUser(123, { currentScene: "scene2" });

      expect(result).toBeNull();
      expect(Logger.error).toHaveBeenCalledWith(
        "Error updating user: Error: Database error",
        "UserDb",
      );
    });
  });

  describe("getAllUsers", () => {
    it("should get all users successfully", async () => {
      const mockUsers = [mockUser, { ...mockUser, id: "2" }];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userDb.getAllUsers();

      expect(result).toEqual(mockUsers);
    });

    it("should return empty array when no users found", async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      const result = await userDb.getAllUsers();

      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      (prisma.user.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await userDb.getAllUsers();

      expect(result).toEqual([]);
      expect(Logger.error).toHaveBeenCalled();
    });
  });
});
