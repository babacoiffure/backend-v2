import ProviderService from "../database/models/ProviderService";
import { handleAsyncHttp } from "../middleware/controller";
import queryHelper from "../utils/query-helper";

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
