import { isBefore } from "date-fns";
import mongoose, { model, Schema } from "mongoose";

// Define fields
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
        required: true,
    },
    expireAt: {
        type: Date,
        required: true,
    },
    renewalStatus: {
        type: String,
        enum: ["Enabled", "Disabled"],
        default: "Enabled",
    },
    status: {
        type: String,
        default: "Active",
        enum: ["Active", "Expired"],
    },
};

// Define Subscription Schema
const subscriptionSchema = new Schema(fields, { timestamps: true });

// Post middleware for find and findOne
subscriptionSchema.post(["find", "findOne"], async function (docs) {
    const now = new Date();

    // If a single document is returned (for findOne), wrap it in an array
    if (!Array.isArray(docs)) docs = [docs];

    // Iterate over all documents and update their status if expired
    for (const doc of docs) {
        if (isBefore(doc?.expireAt, now) && doc.status !== "Expired") {
            doc.status = "Expired";
            await doc.save(); // Save the updated document
        }
    }
});

// Export model
export default model("Subscription", subscriptionSchema);
