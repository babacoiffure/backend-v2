import mongoose, { model, Schema } from "mongoose";

// Insert table fields here
const fields = {
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    availableAt: {
        type: String,
        enum: ["Provider", "Client", "No Matter"],
        required: true,
    },
    timePeriods: [
        {
            type: String,
            required: true,
        },
    ],
};

// Exporting model
export default model(
    "ProviderSchedule",
    new Schema(fields, {
        timestamps: true,
    })
);
