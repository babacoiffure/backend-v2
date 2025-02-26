import { Router } from "express";
import {
    handleCreateAppointmentPaymentIntent,
    handleCreateCheckoutSession,
    handleCreateSubscriptionPlanPaymentIntent,
    handleSuccessfulAppointmentPayment,
    handleSuccessfulSubscriptionPayment,
} from "../../controllers/payment.controller";

export const paymentRouter = Router();

paymentRouter.post(
    "/appointment-payment-intent/create",
    handleCreateAppointmentPaymentIntent
);
paymentRouter.post(
    "/appointment-payment-intent/success",
    handleSuccessfulAppointmentPayment
);

paymentRouter.post(
    "/subscription-payment-intent/create",
    handleCreateSubscriptionPlanPaymentIntent
);
paymentRouter.post(
    "/subscription-payment-intent/success",
    handleSuccessfulSubscriptionPayment
);

paymentRouter.post("/create-checkout-session", handleCreateCheckoutSession);
