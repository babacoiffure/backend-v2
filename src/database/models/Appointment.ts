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
    providerScheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProviderSchedule",
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
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
        default: null,
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
    instruction: {
        type: String,
        default: "",
    },
};

// Exporting model
export default model(
    "Appointment",
    new Schema(fields, {
        timestamps: true,
    }).pre("save", async function (next) {
        // if (!(await User.findById(this.clientId)))
        //     return next(new Error("Wrong client Id"));
        // if (!(await User.findById(this.providerId)))
        //     return next(new Error("Wrong provider Id"));
        // const providerService = await ProviderService.findById(
        //     this.providerServiceId
        // );
        // console.log(providerService);
        // if (!providerService) {
        //     console.log(providerService);
        //     return next(new Error("Wrong provider service id"));
        // }
        // const schedule = await ProviderSchedule.findById(
        //     this.providerScheduleId
        // );
        // if (!schedule) return next(new Error("Wrong provider service id"));
        // if (
        //     !schedule.timePeriods.find((x) => x.timePeriod === this.timePeriod)
        // ) {
        //     return next(
        //         new Error("Time period not matched with provider schedule")
        //     );
        // }
        next();
    })
);
