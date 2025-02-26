import mongoose, { model, Schema } from "mongoose";

// Insert table fields here
const fields = {
    providerId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    clientId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    providerServiceId: {
        type: mongoose.Schema.ObjectId,
        ref: "ProviderService",
        required: true,
    },
    scheduleDate: {
        type: Date,
        required: true,
    },
    timePeriod: {
        type: String,
        required: true,
    },
    paymentMode: {
        type: String,
        enums: ["Regular", "Pre-deposit", "Confirmation"],
        required: true,
    },
    status: {
        type: String,
        enums: ["Accepted", "Pending", "Rejected", "Completed"],
        default: "Pending",
    },
    serviceProvideAt: {
        type: String,
        enum: ["Provider", "Client", "No Matter"],
        required: true,
    },
    serviceProvideLocation: {
        type: String,
        default: null,
    },
    selectedAddons: [
        {
            name: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],
    selectedSizeBasedAddons: [
        {
            name: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            size: {
                type: String,
                required: true,
            },
        },
    ],
    rescheduleProposals: [
        {
            from: {
                type: String,
                enums: ["Client", "Provider"],
            },
            scheduleDate: {
                type: Date,
                required: true,
            },
            timePeriod: {
                type: String,
                required: true,
            },
        },
    ],
};

// Exporting model
export default model(
    "Appointment",
    new Schema(fields, {
        timestamps: true,
    })
);
