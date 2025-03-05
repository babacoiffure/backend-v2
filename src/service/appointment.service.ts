import Appointment from "../database/models/Appointment";
import ProviderSchedule from "../database/models/ProviderSchedule";
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

    await sendUserNotification({
        userId: appointment?.clientId?._id.toString(),
        title: "Appointment accepted",
        data: appointment,
        categoryType: "Appointment",
    });
};
