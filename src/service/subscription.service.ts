import {
    addDays,
    addMonths,
    addWeeks,
    addYears,
    isAfter,
    isBefore,
    sub,
} from "date-fns";
import SubscriptionPlan from "../database/models/SubscriptionPlan";
import { createProductAndPrice } from "../libraries/stripe";
import { ErrorHandler } from "../middleware/error";
import { getUserById } from "./user.service";
import Subscription from "../database/models/Subscription";
import exp from "constants";

export const createSubscriptionPlan = async (data: {
    name: string;
    price: {
        amount: number;
        currency: string;
    };
    recurring: {
        interval: "day" | "month" | "week" | "year";
        intervalCount: number;
    };
}) => {
    const stripeData = await createProductAndPrice({
        name: data.name,
        interval: data.recurring.interval,
        intervalCount: data.recurring.intervalCount,
        priceAmount: data.price.amount,
        priceCurrency: data.price.currency,
    });
    return await SubscriptionPlan.create({ ...data, stripeData });
};
export const getSubscriptionById = async (id: string) => {
    const data = await SubscriptionPlan.findById(id);
    if (!data) throw new ErrorHandler("No data found", 404);
    return data;
};

export const giveSubscriptionToUser = async (
    userId: string,
    subscriptionId: string,
    paymentIntentId: string
) => {
    const subscription = await getSubscriptionById(subscriptionId);
    const user = await getUserById(userId);
    if (user.userType === "Client") {
        throw new ErrorHandler("Client can't buy subscription", 400);
    }
    const issuedAt = Date.now();
    if (!subscription.recurring) {
        throw new Error("invalid subscription");
    }
    const expirePair = {
        day: addDays(issuedAt, subscription.recurring?.intervalCount),
        week: addWeeks(issuedAt, subscription.recurring?.intervalCount),
        month: addMonths(issuedAt, subscription.recurring?.intervalCount),
        year: addYears(issuedAt, subscription.recurring?.intervalCount),
    };
    return await Subscription.create({
        subscriptionPlanId: subscription._id,
        paymentIntentId,
        userId,
        issuedAt,
        expireAt: expirePair[subscription.recurring.interval as never],
        isActive: true,
    });
};

export const checkHasValidSubscription = async (userId: string) => {
    const subs = await Subscription.find({
        userId,
        $gt: { expireAt: Date.now() },
    });

    const activeSubs = subs.filter((sub) => sub.status === "Active");
    const cancelledSubs = subs.filter((sub) => sub.status === "Cancelled");

    if (activeSubs.length > 1) {
        return {
            isValid: true,
            isExpired: false,
            subscription: activeSubs[0],
        };
    } else if (cancelledSubs.length > 1) {
        return {
            isValid: true,
            isExpired: false,
            subscription: cancelledSubs[0],
        };
    } else {
        return {
            isValid: false,
            isExpired: null,
            subscription: null,
        };
    }
};

export const getUserSubscription = async (
    userId: string,
    throwError = true
) => {
    const subs = await Subscription.findOne(
        {
            userId,
        },
        null,
        { populate: ["paymentIntentId", "subscriptionPlanId"] }
    ).sort({ createdAt: -1 });

    if (!subs && throwError) {
        throw new ErrorHandler("No subscription found for this user", 400);
    }
    return subs;
};

export const cancelSubscription = async (userId: string) => {
    const subs = await checkHasValidSubscription(userId);
    if (!subs.isValid || !subs.subscription) {
        throw new ErrorHandler("No subscription found for this user", 400);
    }
    subs.subscription.status = "Cancelled";
    await subs.subscription.save();
    return subs.subscription;
};
