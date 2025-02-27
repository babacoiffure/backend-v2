import { chatEvents } from "../constants/ws-events";
import Chat from "../database/models/Chat";
import ChatMassage, { getReceiverId } from "../database/models/ChatMassage";
import { handleAsyncHttp } from "../middleware/controller";
import { socketServer } from "../server";
import { sendUserNotification } from "../service/notification.service";
import queryHelper from "../utils/query-helper";
export const handleGetChatByUserIds = handleAsyncHttp(async (req, res) => {
    const query = { userIds: req.params.uidPair.split(",") };
    let chat = await Chat.findOne(query);
    if (!chat) {
        chat = await Chat.create(query);
    }
    res.success("Chat conversation", chat);
});

export const handleGetChatById = handleAsyncHttp(async (req, res) => {
    res.success(
        "Chat",
        await Chat.findById(req.params.id, null, {
            populate: ["userIds", "lastMessageId"],
        })
    );
});

export const handleSendChatMessage = handleAsyncHttp(async (req, res) => {
    const { chatId, content, senderId } = req.body;
    console.log(req.body);
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.error("Chat not found", 404);
    }
    const message = await ChatMassage.create({
        chatId,
        senderId,
        content,
    });
    const newMessage = await ChatMassage.findById(message._id, null, {
        populate: ["senderId"],
    });
    if (!newMessage) return res.error("No message");
    chat.lastMessageId = newMessage._id;
    await chat.save();
    socketServer.emit(chatEvents.chatNewMessage(chatId), newMessage);
    // send notification by socket
    // let receiverId = getReceiverId(senderId, chat.userIds as any);
    // await sendUserNotification(receiverId, "New Message", newMessage);
    res.success("newMessage sent", newMessage);
});
export const handleEditChatMessage = handleAsyncHttp(async (req, res) => {
    let message = await ChatMassage.findByIdAndUpdate(req.params.id);
    if (!message) {
        return res.error("Message not found");
    }
    await ChatMassage.findByIdAndUpdate(req.params.messageId, req.body, {
        new: true,
        runValidators: true,
    });

    socketServer.emit(
        chatEvents.chatMessageUpdated(message.chatId?.toString()),
        message
    );
    // send notification by socket
    res.success("message updated", message);
});
export const handleDeleteChatMessage = handleAsyncHttp(async (req, res) => {
    let message = await ChatMassage.findById(req.params.id);
    if (!message) {
        return res.error("Message not found");
    }
    await ChatMassage.findByIdAndDelete(req.params.id);
    socketServer.emit(
        chatEvents.chatMessageDeleted(message?.chatId.toString()),
        message
    );
    // send notification by socket
    res.success("message deleted");
});
export const handleGetChatList = handleAsyncHttp(async (req, res) => {
    res.success("Chat list", await queryHelper(Chat, req.query));
});
export const handleGetChatMessageList = handleAsyncHttp(async (req, res) => {
    res.success("Message list", await queryHelper(ChatMassage, req.query));
});
