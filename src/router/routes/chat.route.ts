import { Router } from "express";
import {
    handleDeleteChatMessage,
    handleEditChatMessage,
    handleGetChatById,
    handleGetChatByUserIds,
    handleGetChatList,
    handleGetChatMessageList,
    handleSendChatMessage,
} from "../../controllers/chat.controller";

export const chatRouter = Router();

chatRouter.get("/by-id/:id", handleGetChatById);

chatRouter.get("/by-uid/:uidPair", handleGetChatByUserIds);
chatRouter.get("/list", handleGetChatList);
chatRouter.get("/message/list", handleGetChatMessageList);
chatRouter.post("/send-message", handleSendChatMessage);
chatRouter.patch("/edit-message/:id", handleEditChatMessage);
chatRouter.delete("/delete-message/:id", handleDeleteChatMessage);
