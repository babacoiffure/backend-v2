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
        providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to Provider
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to Client
        providerServiceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProviderService",
        }, // Reference to Client
        providerScheduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProviderSchedule",
        }, // Reference to Client
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
