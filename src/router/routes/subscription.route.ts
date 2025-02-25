import { Router } from "express";
import {
    handleCreateSubscription,
    handleGetSubscriptionList,
    handleGetSubscriptionValidity,
    handleInactiveSubscription,
    handleUpdateSubscription,
} from "../../controllers/subscription.controller";

export const subscriptionRouter = Router();

subscriptionRouter.get("/check/:id", handleGetSubscriptionValidity);
subscriptionRouter.get("/list", handleGetSubscriptionList);
subscriptionRouter.post("/create", handleCreateSubscription);
subscriptionRouter.post("/update/:id", handleUpdateSubscription);
subscriptionRouter.post("/inactive/:id", handleInactiveSubscription);
