import { ObjectId } from "mongoose";
import Payment from "../database/models/Payment";
import { ErrorHandler } from "../middleware/error";

export const getPaymentById = async (paymentId: string | ObjectId) => {
	const payment = await Payment.findById(paymentId);
	if (!payment) throw new ErrorHandler("Resource not found", 400);
	return payment;
};

