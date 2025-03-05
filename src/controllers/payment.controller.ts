import Appointment from "../database/models/Appointment";
import Payment from "../database/models/Payment";
import PaymentIntent from "../database/models/PaymentIntent";
import ProviderService from "../database/models/ProviderService";
import User from "../database/models/User";
import {
    generatePaymentIntent,
    getPaymentIntentStatus,
    getStatusMessage,
    stripe,
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
        const { appointmentId, currency } = req.body;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.error("Appointment not found", 400);
        }
        const provider = await User.findById(appointment.providerId);
        const providerService = await ProviderService.findById(
            appointment.providerServiceId
        );
        const selectedAddons = appointment.selectedAddons;
        const selectedSizeBasedAddons = appointment.selectedSizeBasedAddons;
        let isAddonSelected =
            selectedAddons?.length > 0 || selectedSizeBasedAddons?.length > 0;

        if (!provider || !providerService) {
            return res.error("Resource not found", 400);
        }

        const appointmentPaymentMode = appointment.paymentMode;

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
            appointment.paymentId = payment._id;
            await appointment.save();
            const intent = await generatePaymentIntent(
                payAmount * 100,
                currency,
                {
                    // transfer_data: {
                    //     destination: provider.providerSettings?.stripeAccountId,
                    // },
                }
            );
            return res.success("Payment intent created", {
                clientSecret: intent.client_secret,
                payment,
                intentId: intent.id,
            });
        } else if (payment.status === "Paid") {
            return res.error("Already paid", 400);
        } else if (payment.status === "Ongoing") {
            // pre-deposit 2nd phase
            payAmount = payment.dueAmount;
            const intent = await generatePaymentIntent(
                payAmount * 100,
                currency,
                {
                    // transfer_data: {
                    //     destination: provider.providerSettings?.stripeAccountId,
                    // },
                }
            );
            return res.success("Payment intent created", {
                clientSecret: intent.client_secret,
                payment,
                intentId: intent.id,
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
            const intent = await generatePaymentIntent(
                payAmount * 100,
                currency,
                {
                    // transfer_data: {
                    //     destination: provider.providerSettings?.stripeAccountId,
                    // },
                }
            );
            return res.success("Payment intent created", {
                clientSecret: intent.client_secret,
                payment,
                intentId: intent.id,
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
        await acceptAppointmentById(payment.appointmentId.toString());

        res.success(
            "Payment successful",
            {
                payment,
                appointment: await Appointment.findById(payment.appointmentId),
            },
            200
        );
    }
);

export const handleCreateSubscriptionPlanPaymentIntent = handleAsyncHttp(
    async (req, res) => {
        const { subscriptionId, currency, userId } = req.body;
        const subscriptionPlan = await getSubscriptionById(subscriptionId); //subPlan
        const price = (subscriptionPlan.price?.amount as number) * 100;
        const intent = await generatePaymentIntent(price, currency);
        const paymentIntent = await PaymentIntent.create({
            amount: price,
            amountCurrency: currency,
            intentData: intent,
            userId,
        });
        res.success("Intent", paymentIntent, 200);
    }
);

export const handleSuccessfulSubscriptionPayment = handleAsyncHttp(
    async (req, res) => {
        const { intentId, userId, subscriptionId } = req.body;

        const paymentIntent = await PaymentIntent.findById(intentId);

        const stripeIntent = await getPaymentIntentStatus(
            paymentIntent?.intentData.id
        );
        await PaymentIntent.findByIdAndUpdate(paymentIntent?._id, {
            status: stripeIntent.status,
            intentData: stripeIntent,
        });
        if (stripeIntent.status === "succeeded") {
            const subs = await giveSubscriptionToUser(
                userId,
                subscriptionId,
                intentId
            );
            res.success(getStatusMessage(stripeIntent.status), subs);
        } else {
            res.success(
                getStatusMessage(stripeIntent.status),
                paymentIntent,
                400
            );
        }
    }
);

export const handleCreateCheckoutSession = handleAsyncHttp(async (req, res) => {
    const { priceId, customerEmail } = req.body;
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription", // Change to "payment" for one-time services
        customer_email: customerEmail,
        line_items: [
            {
                price: priceId, // Use a Stripe Price ID for subscriptions
                quantity: 1,
            },
        ],
        success_url: "https://albi.netlify.app/payment-success",
        cancel_url: "https://albi.netlify.app/payment-failed",
    });

    res.success("success", { sessionId: session.id, url: session.url });
});
