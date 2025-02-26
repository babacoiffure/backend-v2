import Stripe from "stripe";
import { serverENV } from "../env-config";

export const stripe = new Stripe(serverENV.STRIPE_SECRET_KEY);

export const generatePaymentIntent = async (
    amount: number,
    currency: string,
    options?: any
) => {
    return await stripe.paymentIntents.create({
        amount: amount,
        currency,
        automatic_payment_methods: { enabled: true },
        // payment_method_types: ["card", "google_pay", "apple_pay"],
        ...options,
    });
};

export const createProviderExpressAccount = async (email: string) =>
    await stripe.accounts.create({
        type: "express", // Can be 'standard', 'express', or 'custom'
        country: "US",
        email,
    });

export const getAccountLink = async (accountId: string) =>
    await stripe.accountLinks.create({
        account: accountId, // Connected account ID
        refresh_url: `${serverENV.domain}/reauth`,
        return_url: `${serverENV.domain}/success`,
        type: "account_onboarding",
    });

export const getPaymentIntentStatus = async (intentId: string) =>
    await stripe.paymentIntents.retrieve(intentId);

export const getStatusMessage = (status: string) => {
    switch (status) {
        case "requires_payment_method":
            return "Waiting for payment details...";
        case "requires_confirmation":
            return "Confirming payment...";
        case "requires_action":
            return "Action needed (3D Secure, etc.)...";
        case "processing":
            return "Processing payment...";
        case "requires_capture":
            return "Payment authorized, awaiting capture...";
        case "canceled":
            return "Payment was canceled.";
        case "succeeded":
            return "Payment successful!";
        default:
            return "Unknown payment status.";
    }
};

export async function createProductAndPrice({
    name,
    priceAmount,
    priceCurrency,
    interval,
    intervalCount,
}: {
    name: string;
    priceAmount: number;
    priceCurrency: "eur" | "usd" | string;
    interval: "month" | "day" | "week" | "year";
    intervalCount: number;
}) {
    const product = await stripe.products.create({
        name: name,
    });

    const price = await stripe.prices.create({
        unit_amount: priceAmount,
        currency: priceCurrency,
        recurring: { interval, interval_count: intervalCount },
        product: product.id,
    });
    return {
        product,
        price,
    };
}

// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
// server.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       req.headers["stripe-signature"],
//       endpointSecret
//     );
//   } catch (err) {
//     console.error("Webhook signature verification failed.", err);
//     return res.sendStatus(400);
//   }

//   switch (event.type) {
//     case "invoice.payment_succeeded":
//       console.log("Subscription Payment Successful");
//       break;
//     case "customer.subscription.deleted":
//       console.log("Subscription Canceled");
//       break;
//     default:
//       console.log(`Unhandled event type: ${event.type}`);
//   }

//   res.json({ received: true });
// });
