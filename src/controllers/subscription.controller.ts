import {
    default as Subscription,
    default as SubscriptionPlan,
} from "../database/models/SubscriptionPlan";
import { stripe } from "../libraries/stripe";
import { handleAsyncHttp } from "../middleware/controller";
import {
    cancelSubscription,
    checkHasValidSubscription,
    createSubscriptionPlan,
    resumeSubscription,
} from "../service/subscription.service";
import queryHelper from "../utils/query-helper";

export const handleCreateSubscriptionPlan = handleAsyncHttp(
    async (req, res) => {
        const {
            name,
            recurringInterval,
            recurringIntervalCount,
            priceAmount,
            priceCurrency,
        } = req.body;

        const subscription = await createSubscriptionPlan({
            name,
            price: {
                amount: priceAmount,
                currency: priceCurrency,
            },
            recurring: {
                interval: recurringInterval,
                intervalCount: recurringIntervalCount,
            },
        });
        res.success("Subscription", subscription, 200);
    }
);

export const handleUpdateSubscriptionPlan = handleAsyncHttp(
    async (req, res) => {
        res.success(
            "Subscription updated",
            await Subscription.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            }),
            200
        );
    }
);

export const handleInactiveSubscriptionPlan = handleAsyncHttp(
    async (req, res) => {
        res.success(
            "Subscription inactivated",
            await Subscription.findByIdAndUpdate(
                req.params.id,
                { isActive: false },
                {
                    new: true,
                    runValidators: true,
                }
            ),
            200
        );
    }
);

export const handleGetSubscriptionListPlan = handleAsyncHttp(
    async (req, res) => {
        res.success("List", await queryHelper(Subscription, req.query), 200);
    }
);

export const handleGetSubscriptionValidity = handleAsyncHttp(
    async (req, res) => {
        const data = await checkHasValidSubscription(req.params.id);
        res.success("Subscription status", data, 200);
    }
);

export const handleCancelProviderSubscription = handleAsyncHttp(
    async (req, res) => {
        const data = await cancelSubscription(req.params.id);
        res.success("Subscription canceled", data, 200);
    }
);
export const handleResumeProviderSubscription = handleAsyncHttp(
    async (req, res) => {
        const data = await resumeSubscription(req.params.id);
        res.success("Subscription canceled", data, 200);
    }
);

// export const handleCreateSubscription = handleAsyncHttp(async (req, res) => {
//     const { paymentMethodId, customerEmail, subscriptionPlanId } = req.body;
//     const subscriptionPlan = await SubscriptionPlan.findById(
//         subscriptionPlanId
//     );
//     if (!subscriptionPlan) {
//         return res.error("Invalid subscription");
//     }
//     // Create or get customer
//     let customer = (await stripe.customers.list({ email: customerEmail }))
//         .data[0];
//     if (!customer) {
//         customer = await stripe.customers.create({
//             email: customerEmail,
//             payment_method: paymentMethodId,
//             invoice_settings: { default_payment_method: paymentMethodId },
//         });
//     }

//     // Create a subscription
//     const subscription = await stripe.subscriptions.create({
//         customer: customer.id,
//         items: [{ price: subscriptionPlan.stripeData?.price.id }],
//         expand: ["latest_invoice.payment_intent"],
//     });
//     console.log(subscription);
//     // have to create subscription in db
//     res.success("Success");
// });
