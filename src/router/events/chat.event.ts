import { chatEvents } from "../../constants/ws-events";
import ChatMassage from "../../database/models/ChatMassage";
import User from "../../database/models/User";
import { WSEvents } from "../../libraries/ws-manager";
import { wsManager } from "../socket-manager";

export const chatEventsHandler = new WSEvents(); //"chat"
chatEventsHandler.addEvent("/send", (c) => {
    wsManager.context?.socketServer?.emit("chat", "hello");
});

chatEventsHandler.addEvent("/message:read", async (c, [payload, cb]) => {
    const { messageId, userId } = payload;
    const message = await ChatMassage.findById(messageId);
    if (!message) {
        return c.socket.emit("error", { message: "message not found by id" });
    }
    if (userId === message.senderId.toString()) {
        return console.log("owner can't change read status");
    }
    await User.findByIdAndUpdate(userId, {
        lastSeen: Date.now(),
    });
    message.isUnread = false;
    await message.save();
    cb(message);
    c.socketServer?.emit(chatEvents.chatMessageRead(), message);
});
