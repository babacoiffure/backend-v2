import { configDotenv } from "dotenv";
import { cleanEnv, num, str } from "envalid";
configDotenv();

export const serverENV = cleanEnv(process.env, {
    domain: str({ default: "http://localhost:9000" }),
    NODE_ENV: str({
        default: "development",
        choices: ["development", "test", "production", "staging"],
    }),
    PORT: num({ default: 9000 }),

    // Database
    Database_URI: str({ default: "mongodb://127.0.0.1:27017/saloon_db" }),

    // Nodemailer
    NODEMAILER_GMAIL_ID: str(),
    NODEMAILER_GMAIL_APP_PASSWORD: str(),

    // cloudinary
    CLOUDINARY_CLOUD_NAME: str(),
    CLOUDINARY_API_KEY: str(),
    CLOUDINARY_API_SECRET: str(),
    CLOUDINARY_API_ENVIRONMENT_VARIABLE: str(),

    // stripe
    STRIPE_SECRET_KEY: str(),

    // tokens
    ACCESS_TOKEN_PRIVATE_KEY: str(),
    ACCESS_TOKEN_PUBLIC_KEY: str(),
    REFRESH_TOKEN_PRIVATE_KEY: str(),
    REFRESH_TOKEN_PUBLIC_KEY: str(),
    ACCESS_TOKEN_EXPIRE_IN: str({ default: "15m" }),
    REFRESH_TOKEN_EXPIRE_IN: str({ default: "7d" }),
});

export const serverConfigs = Object.freeze({
    app: {
        name: "Saloon",
    },
    socket: {
        path: "",
        cors: {
            origin: ["*"],
        },
    },
    cors: {
        origin: "*",
    },
    wildRoutes: [
        "/sign-in",
        "/verify-email-with-otp",
        "/sign-up",
        "/sign-out",
        "/health-check",
        "/forgot-password",
        "/verify-identity-with-otp",
        "/reset-password",
        "/check-auth",
    ],
});
