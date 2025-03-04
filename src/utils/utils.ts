export function generateOTP(length: number) {
    let otp = "";
    let possible = "0123456789";

    for (let i = 0; i < length; i++) {
        otp += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return otp;
}

export const generateRandomNumber = (digit: number) => {
    let randomNum = "";
    let possible = "0123456789";

    for (let i = 0; i < digit; i++) {
        randomNum += possible.charAt(
            Math.floor(Math.random() * possible.length)
        );
    }
    return Number(randomNum);
};

export function getDayMatchQuery(targetDate: string | number) {
    // Create the start and end of the day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0); // Set to 00:00:00.000

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999); // Set to 23:59:59.999
    return {
        $gte: startOfDay,
        $lt: endOfDay,
    };
}
