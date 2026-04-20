import type { CreateUserInput } from "@todolist/shared/schemas/user.schema";
import { env } from "../../config/env.js";
import { AuthenticationError } from "../../shared/errors.js";
import { User } from "../user/user.model.js";

export const loginUser = async (email: string, password: string) => {
  const user = await User.findByEmail(email);
  if (!user) throw new AuthenticationError("Invalid email or password");

  const valid = await user.verifyPassword(password);
  if (!valid) throw new AuthenticationError("Invalid email or password");

  await user.updateLastLoginAt();

  return user.generateTokens(env.JWT_SECRET);
};

export const refreshTokens = async (token: string) => {
  const user = await User.findByRefreshToken(token);
  if (!user) throw new AuthenticationError("Invalid or expired refresh token");

  await user.deleteRefreshToken(token);
  return user.generateTokens(env.JWT_SECRET);
};

export const logoutUser = async (userId: string): Promise<void> => {
  await User.deleteAllRefreshTokens(userId);
};

export const registerUser = async (input: CreateUserInput) => {
  const passwordHash = await User.getPasswordHash(input.password);
  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
  });
  return {
    user: user.getDTO(),
    tokens: await user.generateTokens(env.JWT_SECRET),
  };
};
