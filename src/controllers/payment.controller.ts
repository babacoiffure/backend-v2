import Appointment from "../database/models/Appointment";
import Payment from "../database/models/Payment";
import ProviderService from "../database/models/ProviderService";
import User from "../database/models/User";
import {
    generatePaymentIntent,
    getPaymentIntentStatus,
    getStatusMessage,
} from "../libraries/stripe";
import { handleAsyncHttp } from "../middleware/controller";
import { acceptAppointmentById } from "../service/appointment.service";
import { getPaymentById } from "../service/payment.service";
import {
    getSubscriptionById,
    giveSubscriptionToUser,
} from "../service/subscription.service";
import { getPercentage } from "../utils/helper";

export const handleCreateAppointmentPaymentIntent = handleAsyncHttp(
    async (req, res) => {
        const {
            appointmentId,
            currency,
            selectedAddons,
            selectedSizeBasedAddons,
        } = req.body;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.error("Appointment not found", 400);
        }
        const provider = await User.findById(appointment.providerId);
        const providerService = await ProviderService.findById(
            appointment.providerServiceId
        );
        let isAddonSelected =
            selectedAddons?.length > 0 || selectedSizeBasedAddons?.length > 0;

        if (!provider || !providerService) {
            return res.error("Resource not found", 400);
        }

        const appointmentPaymentMode =
            provider.providerSettings?.appointmentMode;

        const getAppointmentTotalAmount = () => {
            let totalAmount = providerService.price;
            let isAddonSelected =
                selectedAddons?.length > 0 ||
                selectedSizeBasedAddons?.length > 0;

            if (isAddonSelected) {
                selectedAddons.forEach((x: any) => {
                    totalAmount += x.price;
                });
                selectedSizeBasedAddons.forEach((x: any) => {
                    totalAmount += x.price;
                });
            }
            return totalAmount;
        };

        let totalAmount = getAppointmentTotalAmount();
        let payAmount = 0;

        let payment = await Payment.findOne({ appointmentId });

        if (!payment) {
            // pre-deposit
            if (appointmentPaymentMode === "Pre-deposit") {
                payAmount = isAddonSelected
                    ? 20
                    : getPercentage(20, totalAmount);
            } else {
                payAmount = totalAmount;
            }

            payment = await Payment.create({
                appointmentId,
                currency,
                totalAmount,
                providerServiceId: providerService._id,
                dueAmount: totalAmount - payAmount,
                paymentMode:
                    appointmentPaymentMode === "Pre-deposit"
                        ? "Pre-deposit"
                        : "Regular",
            });
            const intent = await generatePaymentIntent(payAmount, currency, {
                // transfer_data: {
                //     destination: provider.providerSettings?.stripeAccountId,
                // },
            });
            return res.success("Payment intent created", {
                clientSecret: intent.client_secret,
                payment,
            });
        } else if (payment.status === "Paid") {
            return res.error("Already paid", 400);
        } else if (payment.status === "Ongoing") {
            // pre-deposit 2nd phase
            payAmount = payment.dueAmount;
            const intent = await generatePaymentIntent(payAmount, currency, {
                // transfer_data: {
                //     destination: provider.providerSettings?.stripeAccountId,
                // },
            });
            return res.success("Payment intent created", {
                clientSecret: intent.client_secret,
                payment,
            });
        } else {
            if (appointmentPaymentMode === "Pre-deposit") {
                payAmount = isAddonSelected
                    ? 20
                    : getPercentage(20, totalAmount);
            } else {
                payAmount = totalAmount;
            }

            // has payment intent but that was not successful
            const intent = await generatePaymentIntent(payAmount, currency, {
                // transfer_data: {
                //     destination: provider.providerSettings?.stripeAccountId,
                // },
            });
            return res.success("Payment intent created", {
                clientSecret: intent.client_secret,
                payment,
            });
        }
    }
);

export const handleSuccessfulAppointmentPayment = handleAsyncHttp(
    async (req, res) => {
        const { paymentId, stripeData, intentId } = req.body;
        const payment = await getPaymentById(paymentId);
        const paymentIntent = await getPaymentIntentStatus(intentId);
        if (paymentIntent.status !== "succeeded") {
            return res.error("Payment is not successful");
        }

        if (payment.status === "Pending") {
            payment.status =
                payment.paymentMode === "Pre-deposit" ? "Ongoing" : "Paid";
            payment.successfulPayments.push({
                amount: paymentIntent.amount,
                stripeData,
            });
        } else if (payment.status === "Ongoing") {
            // 2nd phase of payment
            payment.status = "Paid";
            payment.successfulPayments.push({
                amount: paymentIntent.amount,
                stripeData,
            });
        }
        await payment.save();
        if (payment.status === "Paid") {
            await acceptAppointmentById(payment.appointmentId.toString());
        }
        res.success("Payment successful", payment, 200);
    }
);

export const handleCreateSubscriptionPaymentIntent = handleAsyncHttp(
    async (req, res) => {
        const { subscriptionId, currency } = req.body;
        const subscription = await getSubscriptionById(subscriptionId);
        const intent = await generatePaymentIntent(
            subscription.price,
            currency
        );
        res.success("Intent", intent, 200);
    }
);

export const handleSuccessfulSubscriptionPayment = handleAsyncHttp(
    async (req, res) => {
        const { stripeData, intentId, userId, subscriptionId } = req.body;
        const paymentIntent = await getPaymentIntentStatus(intentId);
        if (paymentIntent.status === "succeeded") {
            const subs = await giveSubscriptionToUser(
                userId,
                subscriptionId,
                stripeData
            );
            res.success(getStatusMessage(paymentIntent.status), subs);
        } else {
            res.success(
                getStatusMessage(paymentIntent.status),
                paymentIntent,
                400
            );
        }
    }
);
