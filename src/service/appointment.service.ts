import Appointment from "../database/models/Appointment";
import { ErrorHandler } from "../middleware/error";
import { sendUserNotification } from "./notification.service";

export const acceptAppointmentById = async (id: string) => {
    let appointment = await Appointment.findById(id, null, {
        populate: ["providerId", "clientId", "providerServiceId"],
    });
    if (!appointment || appointment?.status === "Accepted") {
        throw new ErrorHandler("Already accepted", 400);
    }
    appointment.status = "Accepted";
    await appointment.save();
    await sendUserNotification({
        userId: appointment?.clientId?._id.toString(),
        title: "Appointment accepted",
        data: appointment,
        categoryType: "Appointment",
    });
};
