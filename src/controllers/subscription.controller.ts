import Subscription from "../database/models/Subscription";
import { handleAsyncHttp } from "../middleware/controller";
import { checkHasValidSubscription } from "../service/subscription.service";
import queryHelper from "../utils/query-helper";

export const handleCreateSubscription = handleAsyncHttp(async (req, res) => {
    res.success("Subscription", await Subscription.create(req.body), 200);
});

export const handleUpdateSubscription = handleAsyncHttp(async (req, res) => {
    res.success(
        "Subscription updated",
        await Subscription.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }),
        200
    );
});

export const handleInactiveSubscription = handleAsyncHttp(async (req, res) => {
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
});

export const handleGetSubscriptionList = handleAsyncHttp(async (req, res) => {
    res.success("List", await queryHelper(Subscription, req.query), 200);
});

export const handleGetSubscriptionValidity = handleAsyncHttp(
    async (req, res) => {
        const data = await checkHasValidSubscription(req.params.id);
        res.success("Subscription status", data, 200);
    }
);
