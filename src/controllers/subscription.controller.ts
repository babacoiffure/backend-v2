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
        res.success("Subscription resumed", data, 200);
    }
);
