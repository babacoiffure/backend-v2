import ProviderSchedule from "../database/models/ProviderSchedule";
import ProviderService from "../database/models/ProviderService";
import { handleAsyncHttp } from "../middleware/controller";
import queryHelper from "../utils/query-helper";
import { getDayMatchQuery } from "../utils/utils";

export const handleCreateProviderService = handleAsyncHttp(async (req, res) => {
    const data = await ProviderService.create(req.body);
    res.success("Service created", data, 201);
});

export const handleUpdateProviderService = handleAsyncHttp(async (req, res) => {
    const data = await ProviderService.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );
    res.success("Update done", data);
});
export const handleDeleteProviderService = handleAsyncHttp(async (req, res) => {
    const data = await ProviderService.findByIdAndDelete(req.params.id);
    res.success("Deleted.", data);
});

export const handleGetProviderServiceList = handleAsyncHttp(
    async (req, res) => {
        res.success("List", await queryHelper(ProviderService, req.query));
    }
);

export const handleGetProviderServiceById = handleAsyncHttp(
    async (req, res) => {
        res.success(
            "Provider service",
            await ProviderService.findById(req.params.id)
        );
    }
);

export const handleGetProviderServiceListBySchedule = handleAsyncHttp(
    async (req, res) => {
        const query: any = {};
        if (req.params?.scheduleDate) {
            query.scheduleDate = getDayMatchQuery(req.body.scheduleDate);
        }
        const schedules = await ProviderSchedule.find(query).limit(20);
        let services: any[] = [];
        for (let schedule of schedules) {
            services = services.concat(
                await ProviderService.find(
                    { ownerId: schedule.providerId.toString() },
                    null,
                    { populate: ["ownerId"] }
                )
            );
        }
        return res.success("serviceList", services);
    }
);
