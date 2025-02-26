import mongoose, { model, Schema } from "mongoose";
const fields = {
    userIds: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
    ],
    lastMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChatMessage",
        default: null,
    },
};
export default model("Chat", new Schema(fields, { timestamps: true }));
