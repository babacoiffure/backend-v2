import env from "dotenv";
import * as nodemailer from "nodemailer";
env.config();
const transporter = nodemailer.createTransport({
	host: "smtp.hostinger.com",
	port: 465,
	secure: true, // true for 465, false for other ports
	auth: {
		user: process.env.HOSTINGER_EMAIL,
		pass: process.env.HOSTINGER_PASSWORD,
	},
	tls: {
		// Do not fail on invalid certs
		rejectUnauthorized: false,
	},
});
export const sendEmail = async ({ to, subject, html, text }: any) => {
	try {
		const info = await transporter.sendMail({
			from: process.env.HOSTINGER_EMAIL,
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
