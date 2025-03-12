import mongoose, { model, Schema } from "mongoose";

// Insert table fields here
const fields = {
    userId: {
        type: String,
        required: true,
    },
    paymentIntentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "PaymentIntent",
    },
    subscriptionPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "SubscriptionPlan",
    },
    issuedAt: {
        type: Date,
        default: null,
    },
    expireAt: {
        type: Date,
        default: null,
    },
    status: {
        type: String,
        default: "Active",
        enums: ["Active", "Cancelled"],
    },
};

// Exporting model
export default model(
    "Subscription",
    new Schema(fields, {
        timestamps: true,
    })
);
