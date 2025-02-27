import UserNotification from "../database/models/UserNotification";
import { handleAsyncHttp } from "../middleware/controller";
import { sendUserNotification } from "../service/notification.service";
import queryHelper from "../utils/query-helper";

export const handleGetNotificationList = handleAsyncHttp(async (req, res) => {
    res.success("list", await queryHelper(UserNotification, req.query));
});

export const handleSendUserNotification = handleAsyncHttp(async (req, res) => {
    const { userId, categoryType, data, title } = req.body;
    const notification = await sendUserNotification({
        userId,
        title,
        categoryType,
        data,
    });
    res.success("Notification sent", notification);
});
