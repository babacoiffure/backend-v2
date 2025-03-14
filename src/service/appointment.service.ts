import Appointment from "../database/models/Appointment";
import ProviderSchedule from "../database/models/ProviderSchedule";
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
