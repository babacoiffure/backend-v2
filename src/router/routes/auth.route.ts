import { Router } from "express";
import {
    handleChangeEmailRequest,
    handleChangeEmailRequestVerify,
    handleChangePassword,
    handleCredentialSignIn,
    handleCredentialSignUp,
    handleDeleteAccount,
    handleForgotPassword,
    handleReissueToken,
    handleResetPassword,
    handleSignOut,
    handleVerifyEmailWithOTP,
    handleVerifyOTP,
} from "../../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/credential/sign-up", handleCredentialSignUp);
authRouter.post("/verify-email-with-otp", handleVerifyEmailWithOTP);
authRouter.post("/credential/sign-in", handleCredentialSignIn);
authRouter.post("/change-password", handleChangePassword);
authRouter.post("/change-email-request", handleChangeEmailRequest);
authRouter.post("/change-email-request-verify", handleChangeEmailRequestVerify);
authRouter.post("/delete-account", handleDeleteAccount);
authRouter.post("/forgot-password", handleForgotPassword);
authRouter.post("/verify-identity-with-otp", handleVerifyOTP);
authRouter.post("/reset-password", handleResetPassword);
authRouter.get("/reissue-auth-token", handleReissueToken);
authRouter.get("/sign-out", handleSignOut);
