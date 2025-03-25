import env from "dotenv";
import * as nodemailer from "nodemailer";
import { serverENV } from "../env-config";

env.config();

// Define default values for email configuration
const EMAIL_USERNAME = serverENV.EMAIL_USERNAME || process.env.EMAIL_USERNAME || 'test@example.com';
const EMAIL_PASSWORD = serverENV.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD || 'password';

const transporter = nodemailer.createTransport({
	host: "smtp.tem.scaleway.com",
	port: 465,
	secure: true, // true for 465, false for other ports
	auth: {
		user: EMAIL_USERNAME,
		pass: EMAIL_PASSWORD,
	},
	tls: {
		// Do not fail on invalid certs
		rejectUnauthorized: false,
	},
});
export const sendEmail = async ({ to, subject, html, text }: any) => {
	try {
		const info = await transporter.sendMail({
			from: EMAIL_USERNAME, // Using the email username as sender
			to,
			subject,
			text,
			html,
		});
		console.log("Email sent successfully!", info.response);
	} catch (error) {
		console.error("Error sending email:", error);
	}
};
