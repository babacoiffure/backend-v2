import ProviderSchedule from "../database/models/ProviderSchedule";
import { handleAsyncHttp } from "../middleware/controller";
import queryHelper from "../utils/query-helper";
import { isUTCDateString } from "../utils/time";
import { getDayMatchQuery } from "../utils/utils";

export const handleSaveProviderSchedule = handleAsyncHttp(async (req, res) => {
	const { userId, userType } = req.headers;

	if (userType !== "Provider") {
		return res.error("You are not a provider");
	}


	console.log()
	const inputtedDate = new Date(req.body.scheduleDate)
	const finalDate = new Date(inputtedDate).setDate(inputtedDate.getUTCDate() + 1)
	let providerSchedule = await ProviderSchedule.findOne({
		providerId: userId,
		scheduleDate: getDayMatchQuery(finalDate),
	});

	if (!providerSchedule) {
		providerSchedule = await ProviderSchedule.create({
			...req.body,
			providerId: userId,
		});
	} else {
		providerSchedule = await ProviderSchedule.findByIdAndUpdate(
			providerSchedule._id,
			req.body,
			{ new: true, runValidators: true }
		);
	}
	res.success("Provider's schedule", providerSchedule);
});

export const handleGetProviderScheduleList = handleAsyncHttp(
	async (req, res) => {
		const schedule = await queryHelper(ProviderSchedule, req.query);
		res.success("List", schedule);
	}
);
