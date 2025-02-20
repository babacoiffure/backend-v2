import User from "../database/models/User";
import { ErrorHandler } from "../middleware/error";

export const getUserById = async (id: string) => {
    const user = await User.findById(id, null);
    if (!user) throw new ErrorHandler("User not found", 400);
    return user;
};
