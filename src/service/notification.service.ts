import { notificationEvents } from "../constants/ws-events";
import UserNotification from "../database/models/UserNotification";
import { socketServer } from "../server";

export const sendUserNotification = async ({
    userId,
    title,
    categoryType,
    data,
}: {
    userId: string;
    title: string;
    categoryType: string;
    data?: Record<string, any> | null;
}) => {
    const notification = await UserNotification.create({
        title,
        userId,
        data,
        categoryType,
    });
    socketServer.emit(
        notificationEvents.sendUserNotification(userId),
        notification
    );
    return notification;
};
export const updateUserNotification = async (
    id: string,
    update: Record<string, any>
) => {
    let notification = await UserNotification.findById(id);
    if (!notification) {
        throw new Error("No notification found");
    }
    await UserNotification.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
    });

    socketServer.emit(
        notificationEvents.sendUserNotificationUpdate(
            notification.userId as string
        ),
        await UserNotification.findById(id)
    );
};
