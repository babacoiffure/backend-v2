import mongoose, { model, Schema } from "mongoose";

// Insert table fields here
const fields = {
    intentData: {
        type: Object,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    amountCurrency: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enums: [
            "canceled",
            "succeeded",
            "requires_payment_method",
            "requires_confirmation",
            "requires_action",
            "processing",
            "requires_capture",
            "unknown",
        ],
        default: "processing",
    },
};

// Exporting model
export default model(
    "PaymentIntent",
    new Schema(fields, {
        timestamps: true,
    })
);
