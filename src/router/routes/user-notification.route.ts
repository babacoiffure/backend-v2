import { Router } from "express";
import {
    handleGetNotificationList,
    handleSendUserNotification,
} from "../../controllers/notification.controller";

export const userNotificationRouter = Router();

userNotificationRouter.get("/list", handleGetNotificationList);
userNotificationRouter.post("/send", handleSendUserNotification);
