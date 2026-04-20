import type { UserDTO } from "@todolist/shared/schemas/user.schema";

interface FullAuthTokens {
  accessToken: string;
  refreshToken: string;
}

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  Prisma,
  type User as PrismaUser,
} from "../../generated/prisma/client.js";
import { prisma } from "../../infra/db.js";
import { ConflictError } from "../../shared/errors.js";

interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export class User {
  constructor(private readonly _data: PrismaUser) {}

  static async getPasswordHash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async create(data: CreateUserData): Promise<User> {
    try {
      const row = await prisma.user.create({ data });
      return new User(row);
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") throw new ConflictError("Email already taken");
      }
      throw e;
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { email } });
    return row ? new User(row) : null;
  }

  static async deleteAllRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  static async findByRefreshToken(token: string): Promise<User | null> {
    const record = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!record) return null;
    if (record.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { token } });
      return null;
    }
    return new User(record.user);
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.delete({ where: { token } });
  }

  async updateLastLoginAt(): Promise<void> {
    await prisma.user.update({
      where: { id: this._data.id },
      data: { lastLoginAt: new Date() },
    });
  }

  async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this._data.passwordHash);
  }

  async generateTokens(secret: string): Promise<FullAuthTokens> {
    const accessToken = jwt.sign(
      { id: this._data.id, email: this._data.email },
      secret,
      { expiresIn: "15m" },
    );
    const refreshToken = crypto.randomUUID();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: this._data.id, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  getDTO(): UserDTO {
    return {
      id: this._data.id,
      name: this._data.name,
      email: this._data.email,
      createdAt: this._data.createdAt.toISOString(),
      lastLoginAt: this._data.lastLoginAt?.toISOString() ?? null,
    };
  }
}
