import User from "../database/models/User";
import { ErrorHandler } from "../middleware/error";

export const getUserById = async (id: string, options: any = {}) => {
    const user = await User.findById(id, null, ...options);
    if (!user) throw new ErrorHandler("User not found", 400);
    return user;
};
