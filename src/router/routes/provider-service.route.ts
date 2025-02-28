import { Router } from "express";
import {
    handleCreateProviderService,
    handleDeleteProviderService,
    handleGetProviderServiceById,
    handleGetProviderServiceList,
    handleGetProviderServiceListBySchedule,
    handleUpdateProviderService,
} from "../../controllers/provider-service.controller";

export const providerServiceRouter = Router();

providerServiceRouter.post("/create", handleCreateProviderService);
providerServiceRouter.patch("/update/:id", handleUpdateProviderService);
providerServiceRouter.delete("/delete/:id", handleDeleteProviderService);
providerServiceRouter.get("/list", handleGetProviderServiceList);
providerServiceRouter.get(
    "/list-by-schedule",
    handleGetProviderServiceListBySchedule
);
providerServiceRouter.get("/by-id/:id", handleGetProviderServiceById);
