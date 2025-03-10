import { Router } from "express";
import {
    handleCreateSubscription,
    handleCreateSubscriptionPlan,
    handleGetSubscriptionListPlan,
    handleGetSubscriptionValidity,
    handleInactiveSubscriptionPlan,
    handleUpdateSubscriptionPlan,
} from "../../controllers/subscription.controller";

export const subscriptionRouter = Router();

subscriptionRouter.get("/check/:id", handleGetSubscriptionValidity);
subscriptionRouter.post("/create", handleCreateSubscription);
// plan
subscriptionRouter.get("/plan/list", handleGetSubscriptionListPlan);
subscriptionRouter.get("/plan/by-id/:id", handleGetSubscriptionListPlan);
subscriptionRouter.post("/plan/create", handleCreateSubscriptionPlan);
subscriptionRouter.post("/plan/update/:id", handleUpdateSubscriptionPlan);
subscriptionRouter.post("/plan/inactive/:id", handleInactiveSubscriptionPlan);
