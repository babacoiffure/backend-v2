import ProviderSchedule from "../database/models/ProviderSchedule";
import User from "../database/models/User";
import { handleAsyncHttp } from "../middleware/controller";
import queryHelper from "../utils/query-helper";
import { getDayMatchQuery } from "../utils/utils";

export const handleSaveProviderSchedule = handleAsyncHttp(async (req, res) => {
    const user = await User.findById(req.body.userId);
    if (user?.userType !== "Provider") {
        return res.error("You are not a provider");
    }
    let providerSchedule = await ProviderSchedule.findOne({
        userId: req.params.userId,
        scheduleDate: getDayMatchQuery(req.body.scheduleDate),
    });
    if (!providerSchedule) {
        providerSchedule = await ProviderSchedule.create(req.body);
    } else {
        providerSchedule = await ProviderSchedule.findByIdAndUpdate(
            providerSchedule._id,
            req.body,
            { new: true, runValidators: true }
        );
    }
    res.success("Provider's schedule updated.", providerSchedule);
});

export const handleGetProviderScheduleList = handleAsyncHttp(
    async (req, res) => {
        const schedule = await queryHelper(ProviderSchedule, req.query);
        res.success("List", schedule);
    }
);
