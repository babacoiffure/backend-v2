import mongoose, { model, Schema } from "mongoose";
const fields = {
    title: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    data: {
        type: Object,
        default: null,
    },
    categoryType: {
        type: String,
        required: true,
    },
};
export default model(
    "UserNotification",
    new Schema(fields, { timestamps: true })
);
