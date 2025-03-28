import Appointment from "../database/models/Appointment";
import Payment from "../database/models/Payment";
import ProviderSchedule from "../database/models/ProviderSchedule";
import ProviderService from "../database/models/ProviderService";
import UserNotification from "../database/models/UserNotification";
import { ErrorHandler } from "../middleware/error";
import { sendUserNotification } from "./notification.service";

export const acceptAppointmentById = async (id: string) => {
	let appointment = await Appointment.findById(id, null, {
		populate: ["providerId", "clientId", "providerServiceId"],
	});
	if (!appointment) {
		throw new ErrorHandler("invalid  appointment id", 400);
	}
	const schedule = await ProviderSchedule.findById(
		appointment.providerScheduleId
	);

	if (!schedule) {
		throw new ErrorHandler("Schedule not found", 400);
	}

	const index = schedule.timePeriods.findIndex(
		(x) => x.timePeriod === appointment.timePeriod
	);
	if (index == -1) {
		throw new Error("Time period not exists in provider schedule");
	}
	schedule.timePeriods[index].occupiedAppointmentId = appointment._id;
	await schedule.save();

	appointment.status = "Accepted";
	await appointment.save();

	const nList = await UserNotification.find({
		"data._id": appointment._id,
	});
	for (let i of nList) {
		await UserNotification.findByIdAndDelete(i._id.toString());
	}
	await sendUserNotification({
		userId: appointment?.clientId?._id.toString(),
		title: "Appointment accepted",
		data: appointment.toObject(),
		categoryType: "Appointment Accept",
	});
	await sendUserNotification({
		userId: appointment?.providerId?._id.toString(),
		title: "Appointment accepted",
		data: appointment.toObject(),
		categoryType: "Appointment Accept",
	});
};

export const rejectAppointmentById = async (id: string) => {
	let appointment = await Appointment.findById(id, null, {
		populate: ["providerId", "clientId", "providerServiceId"],
	});
	if (!appointment) {
		throw new ErrorHandler("invalid  appointment id", 400);
	}

	appointment.status = "Rejected";
	await appointment.save();

	const nList = await UserNotification.find({
		"data._id": appointment._id,
	});
	for (let i of nList) {
		await UserNotification.findByIdAndDelete(i._id.toString());
	}
	await sendUserNotification({
		userId: appointment?.clientId?._id.toString(),
		title: "Appointment rejected",
		data: appointment.toObject(),
		categoryType: "Appointment Accept",
	});
	await sendUserNotification({
		userId: appointment?.providerId?._id.toString(),
		title: "Appointment rejected",
		data: appointment.toObject(),
		categoryType: "Appointment rejected",
	});
};

export const getAppointmentPaymentAmount = async (appointmentId: string) => {
	let appointment = await Appointment.findById(appointmentId, null, {
		populate: ["providerId", "clientId"],
	});
	if (!appointment) {
		throw new ErrorHandler("invalid appointment id", 400);
	}

	const providerService = await ProviderService.findById(
		appointment.providerServiceId
	);
	if (!providerService) {
		throw new ErrorHandler("Invalid service id");
	}

	// Amount states
	let totalAmount = 0;
	let payAmount = 0;
	let dueAmount = 0;

	const sizedBasedAddonsActive = providerService.isSizeBasedAddonsActive;
	const hasSelectedAddons = appointment.selectedAddons?.length > 0;
	console.log(
		`isSizedBasedAddonsActive:${sizedBasedAddonsActive}`,
		`SelectedSizedBasedAddons: ${appointment.selectedSizeBasedAddons}`
	);

	// base service amount
	if (sizedBasedAddonsActive) {
		totalAmount = appointment.selectedSizeBasedAddons[0].price;
	} else {
		totalAmount = providerService.price;
	}

	// extra service amount
	if (hasSelectedAddons) {
		appointment.selectedAddons.forEach((x: any) => {
			totalAmount += x.price;
		});
	}
	// Payment Amount calculation  done

	// Payment Mode :: Taking it from appointment because if provider change the payment mode then it should not be reflected in previous appointment
	const appointmentPaymentMode = appointment.paymentMode;
	let payment;
	if (appointment.paymentId) {
		payment = await Payment.findById(appointment.paymentId);
	}

	if (appointmentPaymentMode === "Pre-deposit") {
		// Pre-deposit
		if (!payment || payment.status === "Pending") {
			payAmount = providerService.isSizeBasedAddonsActive
				? 20
				: totalAmount * 0.2; // whatever price is, 20 euro for only handle length
			dueAmount = totalAmount - payAmount;
		} else if (payment.status === "Ongoing") {
			// if pre-deposit payment created and due amount is there
			payAmount = (appointment.paymentId as any).dueAmount;
			dueAmount = dueAmount - payAmount;
		} else {
			throw new Error("Already paid");
		}
	} else {
		// Regular
		payAmount = totalAmount;
		dueAmount = totalAmount - payAmount;
	}

	console.log(totalAmount, payAmount, dueAmount);

	return { totalAmount, payAmount, dueAmount };
};
