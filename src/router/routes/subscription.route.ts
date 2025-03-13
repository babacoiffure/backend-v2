import { Router } from "express";
import {
    handleCancelProviderSubscription,
    handleCreateSubscriptionPlan,
    handleGetSubscriptionListPlan,
    handleGetSubscriptionValidity,
    handleInactiveSubscriptionPlan,
    handleResumeProviderSubscription,
    handleUpdateSubscriptionPlan,
} from "../../controllers/subscription.controller";

export const subscriptionRouter = Router();

subscriptionRouter.get("/check/:id", handleGetSubscriptionValidity);
subscriptionRouter.get("/cancel/:id", handleCancelProviderSubscription);
subscriptionRouter.get("/resume/:id", handleResumeProviderSubscription);

// subscriptionRouter.post("/create", handleCreateSubscription);
// plan
subscriptionRouter.get("/plan/list", handleGetSubscriptionListPlan);
subscriptionRouter.get("/plan/by-id/:id", handleGetSubscriptionListPlan);
subscriptionRouter.post("/plan/create", handleCreateSubscriptionPlan);
subscriptionRouter.post("/plan/update/:id", handleUpdateSubscriptionPlan);
subscriptionRouter.post("/plan/inactive/:id", handleInactiveSubscriptionPlan);
