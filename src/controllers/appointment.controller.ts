import { appointmentEvents } from "../constants/ws-events";
import Appointment from "../database/models/Appointment";
import User from "../database/models/User";
import { handleAsyncHttp } from "../middleware/controller";
import { socketServer } from "../server";
import { acceptAppointmentById } from "../service/appointment.service";
import { sendUserNotification } from "../service/notification.service";
import queryHelper from "../utils/query-helper";
import { getDayMatchQuery } from "../utils/utils";

export const handleMakeAppointment = handleAsyncHttp(async (req, res) => {
    const isExists = await Appointment.findOne({
        scheduleDate: getDayMatchQuery(req.body.scheduleDate),
        timePeriod: req.body.timePeriod,
    });
    if (isExists?.status === "Accepted") {
        return res.error("The timePeriod of this schedule already taken.", 400);
    }

    const provider = await User.findById(req.body.providerId);
    // if (appointmentMode === "Pre-deposit") {
    //     // already payment done
    //     const payment = await Payment.findOne({
    //         clientId: req.body.clientId,
    //         providerServiceId: req.body.providerServiceId,
    //         status: "Pre-deposit",
    //     });
    //     if (!payment) {
    //         return res.error("Pre-deposit not done yet.", 400);
    //     }
    // } else if (appointmentMode === "Regular") {
    //     // already payment done
    //     const payment = await Payment.findOne({
    //         clientId: req.body.clientId,
    //         providerServiceId: req.body.providerServiceId,
    //         status: "Paid",
    //     });
    //     if (!payment) {
    //         return res.error("Full payment is not done yet.", 400);
    //     }
    // }

    const appointment = await Appointment.create({
        status: "Pending",
        paymentMode: provider?.providerSettings?.appointmentMode,
        ...req.body,
    });
    const newAppointment = await Appointment.findById(appointment._id, null, {
        populate: ["providerId", "clientId", "providerServiceId"],
    });
    await sendUserNotification({
        userId: appointment.clientId._id.toString(),
        title: "Appointment created",
        data: newAppointment,
        categoryType: "Appointment",
    });
    await sendUserNotification({
        userId: appointment.providerId._id.toString(),
        title: "You have a new appointment",
        data: newAppointment,
        categoryType: "AppointmentConfirmation",
    });
    res.success("Appointment created", newAppointment);
});

export const handleProposeForRescheduleAppointment = handleAsyncHttp(
    async (req, res) => {
        const { id, proposal } = req.body;
        const appointment = await Appointment.findById(id, null, {
            populate: ["providerId", "clientId", "providerServiceId"],
        });
        if (!appointment) {
            return res.error("No appointment found", 400);
        }
        appointment.rescheduleProposals.push(proposal);
        await appointment.save();
        //TODO: have to check for insertion
        if (proposal.from === "Provider") {
            await sendUserNotification({
                userId: appointment.providerId._id.toString(),
                title: "New reschedule proposal for appointment",
                data: appointment,
                categoryType: "AppointmentRescheduleProposal",
            });
        } else {
            await sendUserNotification({
                userId: appointment.clientId._id.toString(),
                title: "New reschedule proposal for appointment",
                data: appointment,
                categoryType: "AppointmentRescheduleProposal",
            });
        }
        socketServer.emit(
            appointmentEvents.sendAppointmentRescheduleProposal(
                appointment._id.toString()
            ),
            appointment
        );
        res.success("Proposal sent", appointment);
    }
);
export const handleAcceptRescheduleProposalOfAppointment = handleAsyncHttp(
    async (req, res) => {
        let appointment = await Appointment.findById(req.body.id, null, {
            populate: ["providerId", "clientId", "providerServiceId"],
        });
        if (!appointment) {
            return res.error("No appointment", 400);
        }
        const proposal = appointment.rescheduleProposals.find(
            (x) => x._id.toString() === req.body.proposalId
        );
        appointment.rescheduleProposals[
            appointment.rescheduleProposals.length - 1
        ];
        if (!proposal) {
            return res.error("Wrong proposal id");
        }
        appointment.scheduleDate = proposal.scheduleDate;
        appointment.timePeriod = proposal.timePeriod;
        await appointment.save();
        //TODO: have to check for insertion
        socketServer.emit(
            appointmentEvents.appointmentProposalAccept(
                appointment._id.toString()
            ),
            appointment
        );
        res.success("proposal accepted", appointment);
    }
);

export const handleAcceptAppointment = handleAsyncHttp(async (req, res) => {
    //TODO: check provider or
    const appointment = await acceptAppointmentById(req.body.id);
    res.success("Accepted", appointment);
});
export const handleRejectAppointment = handleAsyncHttp(async (req, res) => {
    //TODO: check provider or
    let appointment = await Appointment.findById(req.body.id, null, {
        populate: ["providerId", "clientId", "providerServiceId"],
    });
    if (!appointment) {
        return res.error("Already rejected");
    }
    await Appointment.findOneAndUpdate(appointment._id, {
        status: "Rejected",
    });
    await sendUserNotification({
        userId: appointment?.clientId._id.toString(),
        title: "Appointment rejected",
        data: appointment,
        categoryType: "Appointment",
    });
    res.success("Rejected appointment");
});

export const handleGetAppointmentList = handleAsyncHttp(async (req, res) => {
    const query: any = {
        ...req.query,
    };
    if (req.query?.scheduleDate) {
        query["scheduleDate"] = getDayMatchQuery(req.query.scheduleDate as any);
    }
    res.success("Appointment list", await queryHelper(Appointment, query));
});
