import mongoose, { model, Schema } from "mongoose";

// Insert table fields here
const fields = {
    providerServiceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "ProviderService",
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Appointment",
    },
    status: {
        type: String,
        enums: ["Paid", "Ongoing", "Pending"],
        required: true,
        default: "Pending",
    },
    paymentMode: {
        type: String,
        enums: ["Regular", "Pre-deposit"],
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    dueAmount: {
        type: Number,
        required: true,
    },
    successfulPayments: [
        {
            stripeData: {
                type: Object,
                default: null,
            },
            amount: {
                type: Number,
                required: true,
            },
        },
    ],
};

// Exporting model
export default model(
    "Payment",
    new Schema(fields, {
        timestamps: true,
    })
);
