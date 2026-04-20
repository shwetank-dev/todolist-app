import { NotFoundError } from "../../shared/errors.js";
import { User } from "./user.model.js";

export const getMe = async (email: string) => {
  const user = await User.findByEmail(email);
  if (!user) throw new NotFoundError("User not found");
  return user.getDTO();
};
