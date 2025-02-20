import { NextFunction, Request, Response } from "express";
import { serverConfigs } from "../env-config";
import { verifyAccessToken } from "../utils/jwt";
import { ErrorHandler } from "./error";

export const authenticateJWT = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // check for wild routes
    if (serverConfigs.wildRoutes.some((x) => req.path.includes(x))) {
        const { valid, decoded, expired } = verifyAccessToken(
            req?.cookies["accessToken"]
        );
        if (valid && decoded) {
            req.headers.userId = decoded.userId;
            req.headers.userType = decoded.userType;
        }

        return next();
    }

    // check for accessToken
    let accessToken = req.cookies["accessToken"];

    if (!accessToken) {
        return next(
            new ErrorHandler("Unauthorized access. Please login first.", 401)
        );
    }
    const { valid, decoded, expired } = verifyAccessToken(accessToken);

    if (!valid || !decoded) {
        return next(new ErrorHandler("Invalid token. Please sign in.", 401));
    }
    req.headers.userId = decoded.userId;
    req.headers.userType = decoded.userType;
    next();
};
