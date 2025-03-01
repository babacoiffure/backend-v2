export const chatEvents = {
    chatNewMessage: (chatId: string) => `chat/new-message/${chatId}`,
    chatMessageUpdated: (chatId: string) => `chat/message-update/${chatId}`,
    chatMessageDeleted: (chatId: string) => `chat/message-delete/${chatId}`,
    chatMessageRead: () => `chat/message:read`,
};

export const notificationEvents = {
    sendUserNotification: (userId: string) => `user/notification/${userId}`,
    sendUserNotificationUpdate: (userId: string) =>
        `user/notification-update/${userId}`,
};

export const appointmentEvents = {
    sendAppointmentRescheduleProposal: (appointmentId: string) =>
        `appointment/${appointmentId}/reschedule-proposal`,
    appointmentProposalAccept: (appointmentId: string) =>
        `appointment/${appointmentId}/proposal-accept`,
};
