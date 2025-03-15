import { ObjectId, Types } from "mongoose";
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

export const getAppointmentPaymentAmount = async (appointmentId: string) => {
    let appointment = await Appointment.findById(appointmentId, null, {
        populate: ["providerId", "clientId", "providerServiceId", "paymentId"],
    });
    if (!appointment) {
        throw new ErrorHandler("invalid appointment id", 400);
    }

    // Amount states
    let totalAmount = 0;
    let payAmount = 0;
    let dueAmount = 0;
    const hasSizedBasedAddon = appointment.selectedSizeBasedAddons?.length > 0;
    const hasAddon = appointment.selectedAddons?.length > 0;

    // base service amount
    if (hasSizedBasedAddon) {
        totalAmount = appointment.selectedSizeBasedAddons[0].price;
    } else {
        totalAmount = (appointment.providerServiceId as any).price;
    }

    // extra service amount
    if (hasAddon) {
        appointment.selectedAddons.forEach((x: any) => {
            totalAmount += x.price;
        });
    }
    // Payment Amount calculation  done

    // Payment Mode :: Taking it from appointment because if provider change the payment mode then it should not be reflected in previous appointment
    const appointmentPaymentMode = appointment.paymentMode;
    if (appointmentPaymentMode === "Pre-deposit") {
        // Pre-deposit
        if (!appointment.paymentId) {
            // if pre-deposit payment not created
            payAmount = hasAddon ? 20 : totalAmount * 0.2;
            dueAmount = totalAmount - payAmount;
        } else {
            // if pre-deposit payment created and due amount is there
            payAmount = (appointment.paymentId as any).dueAmount;
            dueAmount = dueAmount - payAmount;
        }
    } else {
        // Regular
        payAmount = totalAmount;
        dueAmount = totalAmount - payAmount;
    }

    return { totalAmount, payAmount, dueAmount };
};
