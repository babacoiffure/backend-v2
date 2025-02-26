import {
    addDays,
    addMonths,
    addWeeks,
    addYears,
    isAfter,
    isBefore,
} from "date-fns";
import SubscriptionPlan from "../database/models/SubscriptionPlan";
import { createProductAndPrice } from "../libraries/stripe";
import { ErrorHandler } from "../middleware/error";
import { getUserById } from "./user.service";
import Subscription from "../database/models/Subscription";

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
    const subscription = await Subscription.findOne(
        {
            isActive: true,
            userId,
        },
        null,
        { populate: ["paymentIntentId", "subscriptionPlanId"] }
    );
    if (!subscription) {
        return {
            subscription,
        };
    }

    const isPaymentSucceed =
        ((subscription.paymentIntentId as any).status as string) ===
        "succeeded";
    const isExpired = isAfter(Date.now(), subscription?.expireAt);
    return {
        isValid: isPaymentSucceed && !isExpired,
        isExpired,
        subscription,
    };
};

export const getUserSubscription = async (
    userId: string,
    throwError = true
) => {
    const subs = await Subscription.findOne({ userId }).sort({
        createdAt: -1,
    });
    console.log(!subs, throwError);
    if (!subs && throwError) {
        throw new ErrorHandler("No subscription found for this user", 400);
    }
    return subs;
};
